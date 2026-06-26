import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User, AuthenticatedUser } from '../common/decorators/user.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Chat & Research Assistant')
@ApiBearerAuth()
@Controller('papers/:id/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOperation({ summary: 'Get chat logs history with a paper' })
  async getHistory(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.chatService.getChatHistory(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Chat with a paper (RAG query)' })
  @ApiBody({ schema: { type: 'object', properties: { question: { type: 'string' } } } })
  async askQuestion(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('question') question: string,
  ) {
    return this.chatService.queryPaper(user.id, id, question);
  }
}
