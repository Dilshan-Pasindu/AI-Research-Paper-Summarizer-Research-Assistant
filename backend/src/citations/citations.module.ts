import { Module } from '@nestjs/common';
import { CitationsService } from './citations.service';
import { CitationsController } from './citations.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  controllers: [CitationsController],
  providers: [CitationsService],
  exports: [CitationsService],
})
export class CitationsModule {}
