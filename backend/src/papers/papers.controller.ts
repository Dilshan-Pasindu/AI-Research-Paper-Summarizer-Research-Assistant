import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PapersService } from './papers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User, AuthenticatedUser } from '../common/decorators/user.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Research Papers')
@ApiBearerAuth()
@Controller('papers')
@UseGuards(JwtAuthGuard)
export class PapersController {
  constructor(private readonly papersService: PapersService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a PDF research paper' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadPaper(
    @User() user: AuthenticatedUser,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'application/pdf',
        })
        .addMaxSizeValidator({
          maxSize: 20 * 1024 * 1024, // 20MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.papersService.uploadAndProcess(user.id, file);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all papers in user library' })
  async getLibrary(@User() user: AuthenticatedUser) {
    return this.papersService.findAll(user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search papers by title or author' })
  async searchPapers(
    @User() user: AuthenticatedUser,
    @Query('q') query: string,
  ) {
    return this.papersService.searchPapers(user.id, query || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific paper' })
  async getPaperDetails(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.papersService.findOne(user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a paper from library' })
  async deletePaper(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.papersService.remove(user.id, id);
  }

  @Post('compare')
  @ApiOperation({ summary: 'Compare multiple research papers' })
  @ApiBody({ schema: { type: 'object', properties: { paperIds: { type: 'array', items: { type: 'string' } } } } })
  async compare(
    @User() user: AuthenticatedUser,
    @Body('paperIds') paperIds: string[],
  ) {
    return this.papersService.comparePapers(user.id, paperIds);
  }
}
