import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User, AuthenticatedUser } from '../common/decorators/user.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Summaries')
@ApiBearerAuth()
@Controller('papers/:id/summary')
@UseGuards(JwtAuthGuard)
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Post()
  @ApiOperation({ summary: 'Generate AI summary for a research paper' })
  async generateSummary(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.summaryService.generate(user.id, id);
  }

  @Get()
  @ApiOperation({ summary: 'Get cached summary for a research paper' })
  async getSummary(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.summaryService.get(user.id, id);
  }
}
