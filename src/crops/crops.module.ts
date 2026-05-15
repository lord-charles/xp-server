import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

// Phase 1
import { CyclesController } from './cycles/cycles.controller';
import { CyclesService } from './cycles/cycles.service';
import { CropsController } from './crops/crops.controller';
import { CropsService } from './crops/crops.service';

// Phase 2
import { SoilPrepController } from './activities/soil-prep/soil-prep.controller';
import { SoilPrepService } from './activities/soil-prep/soil-prep.service';
import { TillageController } from './activities/tillage/tillage.controller';
import { TillageService } from './activities/tillage/tillage.service';
import { PlantingController } from './activities/planting/planting.controller';
import { PlantingService } from './activities/planting/planting.service';

// Phase 3
import { FertilizersController } from './activities/fertilizers/fertilizers.controller';
import { FertilizersService } from './activities/fertilizers/fertilizers.service';
import { IrrigationController } from './activities/irrigation/irrigation.controller';
import { IrrigationService } from './activities/irrigation/irrigation.service';
import { WeedingController } from './activities/weeding/weeding.controller';
import { WeedingService } from './activities/weeding/weeding.service';
import { ChemicalsController } from './activities/chemicals/chemicals.controller';
import { ChemicalsService } from './activities/chemicals/chemicals.service';

// Phase 4
import { DiseasesController } from './activities/diseases/diseases.controller';
import { DiseasesService } from './activities/diseases/diseases.service';
import { PestsController } from './activities/pests/pests.controller';
import { PestsService } from './activities/pests/pests.service';
import { HarvestingController } from './activities/harvesting/harvesting.controller';
import { HarvestingService } from './activities/harvesting/harvesting.service';
import { ProcessingController } from './activities/processing/processing.controller';
import { ProcessingService } from './activities/processing/processing.service';

// Phase 5
import { LossesController } from './activities/losses/losses.controller';
import { LossesService } from './activities/losses/losses.service';
import { CropSalesController } from './activities/crop-sales/crop-sales.controller';
import { CropSalesService } from './activities/crop-sales/crop-sales.service';
import { CropAlertsController } from './activities/crop-alerts/crop-alerts.controller';
import { CropAlertsService } from './activities/crop-alerts/crop-alerts.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    // Phase 1
    CyclesController,
    CropsController,
    // Phase 2
    SoilPrepController,
    TillageController,
    PlantingController,
    // Phase 3
    FertilizersController,
    IrrigationController,
    WeedingController,
    ChemicalsController,
    // Phase 4
    DiseasesController,
    PestsController,
    HarvestingController,
    ProcessingController,
    // Phase 5
    LossesController,
    CropSalesController,
    CropAlertsController,
  ],
  providers: [
    // Phase 1
    CyclesService,
    CropsService,
    // Phase 2
    SoilPrepService,
    TillageService,
    PlantingService,
    // Phase 3
    FertilizersService,
    IrrigationService,
    WeedingService,
    ChemicalsService,
    // Phase 4
    DiseasesService,
    PestsService,
    HarvestingService,
    ProcessingService,
    // Phase 5
    LossesService,
    CropSalesService,
    CropAlertsService,
  ],
  exports: [CyclesService, CropsService],
})
export class CropsModule {}
