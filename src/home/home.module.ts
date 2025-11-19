import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';

@Module({
  imports: [PrismaModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
