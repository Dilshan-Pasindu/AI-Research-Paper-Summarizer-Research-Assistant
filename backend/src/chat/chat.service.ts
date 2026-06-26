import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ChatHistory } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class ChatService {
  private aiServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
  }

  async getChatHistory(userId: string, paperId: string): Promise<ChatHistory[]> {
    // Verify paper ownership
    const paper = await this.prisma.paper.findFirst({
      where: { id: paperId, userId },
    });
    if (!paper) {
      throw new NotFoundException('Research paper not found in your library');
    }

    return this.prisma.chatHistory.findMany({
      where: { userId, paperId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async queryPaper(
    userId: string,
    paperId: string,
    question: string,
  ): Promise<{ answer: string }> {
    // 1. Verify paper exists and belongs to the user
    const paper = await this.prisma.paper.findFirst({
      where: { id: paperId, userId },
    });
    if (!paper) {
      throw new NotFoundException('Research paper not found in your library');
    }

    // 2. Fetch past 10 message logs to form conversational context
    const recentMessages = await this.prisma.chatHistory.findMany({
      where: { userId, paperId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // reverse to get correct chronological order
    const formattedHistory = recentMessages.reverse().map((msg) => ({
      role: msg.role,
      message: msg.message,
    }));

    // 3. Request answer from RAG microservice
    try {
      const response = await axios.post(`${this.aiServiceUrl}/chat`, {
        paper_id: paperId,
        question: question,
        chat_history: formattedHistory,
      });

      const { answer } = response.data;

      // 4. Save question and answer records concurrently to DB
      await this.prisma.chatHistory.createMany({
        data: [
          { userId, paperId, role: 'user', message: question },
          { userId, paperId, role: 'assistant', message: answer },
        ],
      });

      return { answer };
      
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to query paper chatbot: ${err.response?.data?.detail || err.message}`,
      );
    }
  }
}
