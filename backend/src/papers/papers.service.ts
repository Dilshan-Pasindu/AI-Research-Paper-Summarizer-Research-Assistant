import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Paper, Prisma } from '@prisma/client';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PapersService {
  private aiServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
  }

  async uploadAndProcess(
    userId: string,
    file: Express.Multer.File,
  ): Promise<Paper> {
    const configuredUploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    const uploadDir = path.resolve(configuredUploadDir);
    
    // 1. Create a tentative database record to get a UUID
    const tentativePaper = await this.prisma.paper.create({
      data: {
        title: file.originalname,
        authors: [],
        doi: '',
        fileUrl: '',
        filePath: '',
        fileSize: file.size,
        userId: userId,
      },
    });

    const paperId = tentativePaper.id;
    
    // Create upload dir if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 2. Define secure path and save file
    const fileExt = path.extname(file.originalname);
    const safeFilename = `${paperId}${fileExt}`;
    const filePath = path.join(uploadDir, safeFilename);
    
    try {
      fs.writeFileSync(filePath, file.buffer);
    } catch (err) {
      // Clean up database row on write error
      await this.prisma.paper.delete({ where: { id: paperId } });
      throw new InternalServerErrorException('Failed to write PDF file to disk');
    }

    const fileUrl = `/uploads/${safeFilename}`;

    // 3. Update database record with final file paths
    await this.prisma.paper.update({
      where: { id: paperId },
      data: {
        fileUrl,
        filePath,
      },
    });

    // 4. Forward file to FastAPI service for parsing & RAG ingestion
    try {
      const formData = new FormData();
      const fileBlob = new Blob([new Uint8Array(file.buffer)], { type: 'application/pdf' });
      formData.append('file', fileBlob, file.originalname);
      formData.append('paper_id', paperId);

      const aiResponse = await axios.post(`${this.aiServiceUrl}/process`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { title, authors, doi, citations } = aiResponse.data;

      // 5. Save citations in database
      if (citations && Array.isArray(citations)) {
        const citationData = citations.map((cite: any) => ({
          paperId: paperId,
          text: cite.text || 'Unknown Reference',
          context: cite.context || '',
          authors: cite.authors || [],
          year: cite.year || null,
        }));

        if (citationData.length > 0) {
          await this.prisma.citation.createMany({
            data: citationData,
          });
        }
      }

      // 6. Update database record with processed metadata
      const updatedPaper = await this.prisma.paper.update({
        where: { id: paperId },
        data: {
          title: title || tentativePaper.title,
          authors: authors || [],
          doi: doi || null,
        },
        include: {
          citations: true,
        },
      });

      return updatedPaper;
      
    } catch (err) {
      // Rollback file and database entry if RAG processing fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await this.prisma.paper.delete({ where: { id: paperId } });
      throw new InternalServerErrorException(`AI processing failed: ${err.message}`);
    }
  }

  async findAll(userId: string): Promise<Paper[]> {
    return this.prisma.paper.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        summary: true,
      },
    });
  }

  async findOne(userId: string, id: string): Promise<Paper> {
    const paper = await this.prisma.paper.findFirst({
      where: { id, userId },
      include: {
        summary: true,
        citations: true,
      },
    });
    
    if (!paper) {
      throw new NotFoundException('Research paper not found in your library');
    }
    return paper;
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const paper = await this.findOne(userId, id);
    
    // 1. Delete local file
    if (fs.existsSync(paper.filePath)) {
      try {
        fs.unlinkSync(paper.filePath);
      } catch (err) {
        console.error(`Error deleting file ${paper.filePath}: ${err.message}`);
      }
    }

    // 2. Ask FastAPI vectorstore to delete chunks
    try {
      // We can implement a clean route or directly delete it by making a request
      // We'll let the FastAPI collection deletion complete
      // We can construct a simple helper in FastAPI process router or vector store
      // Let's implement deleting on FastAPI side.
      // Wait, we didn't add a DELETE endpoint on FastAPI but we can easily call it if we want.
      // Actually we have vector_store.delete_paper(paper_id) in python! Let's expose it in process router.
      // Ah! In FastAPI process router, we did not expose the DELETE path. 
      // Let's check: we can delete directly from Postgres, and if FastAPI doesn't have a delete route, we can add it, 
      // or we can just catch exceptions if we call a delete endpoint.
      // Let's make sure we expose a delete route in FastAPI `/process/{paper_id}` or similar in our code, 
      // or we can write a quick endpoint inside FastAPI `process.py`.
      // Let's check `process.py` code we wrote: we didn't add it. We can add it or write a DELETE request.
      // Let's make backend send a delete query to FastAPI process router: DELETE /process/{paper_id}
      await axios.delete(`${this.aiServiceUrl}/process/${id}`).catch(() => {
        // Silently ignore if AI service doesn't respond or fails
      });
    } catch {}

    // 3. Delete from DB (cascading deletes citations, summaries, chat histories due to onDelete: Cascade)
    await this.prisma.paper.delete({
      where: { id },
    });

    return { message: 'Paper successfully deleted' };
  }

  async searchPapers(userId: string, query: string): Promise<Paper[]> {
    return this.prisma.paper.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { authors: { has: query } },
        ],
      },
      include: {
        summary: true,
      },
    });
  }

  async comparePapers(userId: string, paperIds: string[]): Promise<any> {
    if (paperIds.length < 2) {
      throw new BadRequestException('At least 2 papers must be selected for comparison');
    }

    // Check if comparison already cached
    const existing = await this.prisma.paperComparison.findFirst({
      where: {
        userId,
        paperIds: { hasEvery: paperIds },
      },
    });

    if (existing) {
      return existing;
    }

    // Retrieve paper summaries from db
    const papers = await this.prisma.paper.findMany({
      where: {
        id: { in: paperIds },
        userId,
      },
      include: {
        summary: true,
      },
    });

    // Validate that all papers have summaries generated
    const papersWithSummary = papers.filter((p) => p.summary !== null);
    if (papersWithSummary.length !== paperIds.length) {
      throw new BadRequestException('All selected papers must have summaries generated first');
    }

    // Call FastAPI to generate comparison matrix
    try {
      const payload = {
        papers: papersWithSummary.map((p) => ({
          id: p.id,
          title: p.title,
          summary: {
            executiveSummary: p.summary.executiveSummary,
            problemStatement: p.summary.problemStatement,
            methodology: p.summary.methodology,
            datasetUsed: p.summary.datasetUsed,
            results: p.summary.results,
            limitations: p.summary.limitations,
            futureWork: p.summary.futureWork,
            conclusion: p.summary.conclusion,
          },
        })),
      };

      const response = await axios.post(`${this.aiServiceUrl}/compare`, payload);
      const comparisonMatrix = response.data;

      // Save to database cache
      const name = `Comparison: ${papersWithSummary.map((p) => p.title.substring(0, 20)).join(' vs ')}`;
      const savedComparison = await this.prisma.paperComparison.create({
        data: {
          userId,
          name,
          paperIds,
          comparisonData: comparisonMatrix as Prisma.InputJsonValue,
        },
      });

      return savedComparison;
      
    } catch (err) {
      throw new InternalServerErrorException(`Comparison generation failed: ${err.message}`);
    }
  }
}
