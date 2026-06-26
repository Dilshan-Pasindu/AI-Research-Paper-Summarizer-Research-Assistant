import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CitationsService } from './citations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User, AuthenticatedUser } from '../common/decorators/user.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Citations & References')
@ApiBearerAuth()
@Controller('papers/:id/citations')
@UseGuards(JwtAuthGuard)
export class CitationsController {
  constructor(private readonly citationsService: CitationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get extracted academic citations for a paper' })
  async getCitations(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.citationsService.getCitations(user.id, id);
  }
}
