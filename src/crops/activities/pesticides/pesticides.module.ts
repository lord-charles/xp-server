import { Module } from '@nestjs/common';
import { PesticidesService } from './pesticides.service';
import { PesticidesController } from './pesticides.controller';

@Module({
  controllers: [PesticidesController],
  providers: [PesticidesService],
})
export class PesticidesModule {}
