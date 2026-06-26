import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PapersModule } from './papers/papers.module';
import { SummaryModule } from './summary/summary.module';
import { CitationsModule } from './citations/citations.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PapersModule,
    SummaryModule,
    CitationsModule,
    ChatModule,
  ],
})
export class AppModule {}
