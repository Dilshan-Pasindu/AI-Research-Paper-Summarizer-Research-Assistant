import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Summary } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class SummaryService {
  private aiServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
  }

  async generate(userId: string, paperId: string): Promise<Summary> {
    // 1. Verify paper exists and belongs to the user
    const paper = await this.prisma.paper.findFirst({
      where: { id: paperId, userId },
      include: { summary: true },
    });

    if (!paper) {
      throw new NotFoundException('Research paper not found in your library');
    }

    // 2. Return cached summary if it exists
    if (paper.summary) {
      return paper.summary;
    }

    // 3. Make HTTP call to FastAPI AI Service to summarize
    try {
      const response = await axios.post(`${this.aiServiceUrl}/summarize`, {
        paper_id: paperId,
        file_path: paper.filePath,
      });

      const data = response.data;

      // 4. Save summary in PostgreSQL
      const savedSummary = await this.prisma.summary.create({
        data: {
          paperId: paperId,
          executiveSummary: data.executiveSummary,
          problemStatement: data.problemStatement,
          methodology: data.methodology,
          datasetUsed: data.datasetUsed,
          results: data.results,
          limitations: data.limitations,
          futureWork: data.futureWork,
          conclusion: data.conclusion,
        },
      });

      return savedSummary;
      
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to generate paper summary: ${err.response?.data?.detail || err.message}`,
      );
    }
  }

  async get(userId: string, paperId: string): Promise<Summary> {
    // Verify paper ownership
    const paper = await this.prisma.paper.findFirst({
      where: { id: paperId, userId },
    });

    if (!paper) {
      throw new NotFoundException('Research paper not found in your library');
    }

    const summary = await this.prisma.summary.findUnique({
      where: { paperId },
    });

    if (!summary) {
      throw new NotFoundException('Summary not yet generated for this paper');
    }

    return summary;
  }
}
