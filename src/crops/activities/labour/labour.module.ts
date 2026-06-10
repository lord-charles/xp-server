import { Module } from '@nestjs/common';
import { LabourService } from './labour.service';
import { LabourController } from './labour.controller';

@Module({
  controllers: [LabourController],
  providers: [LabourService],
})
export class LabourModule {}
