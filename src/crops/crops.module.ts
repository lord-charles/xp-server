import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CyclesController } from './cycles/cycles.controller';
import { CyclesService } from './cycles/cycles.service';
import { CropsController } from './crops/crops.controller';
import { CropsService } from './crops/crops.service';

@Module({
  imports: [PrismaModule],
  controllers: [CyclesController, CropsController],
  providers: [CyclesService, CropsService],
  exports: [CyclesService, CropsService],
})
export class CropsModule {}
