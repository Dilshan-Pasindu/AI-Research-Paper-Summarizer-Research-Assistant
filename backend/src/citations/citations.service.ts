import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Citation } from '@prisma/client';

@Injectable()
export class CitationsService {
  constructor(private prisma: PrismaService) {}

  async getCitations(userId: string, paperId: string): Promise<Citation[]> {
    // 1. Verify paper ownership
    const paper = await this.prisma.paper.findFirst({
      where: { id: paperId, userId },
    });
    if (!paper) {
      throw new NotFoundException('Research paper not found in your library');
    }

    // 2. Fetch citations
    return this.prisma.citation.findMany({
      where: { paperId },
      orderBy: { year: 'desc' },
    });
  }
}
