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

// Soil Data Collection
import { SoilDataController } from './activities/soil-data/soil-data.controller';
import { SoilDataService } from './activities/soil-data/soil-data.service';
import { FieldConditionsController } from './activities/field-conditions/field-conditions.controller';
import { FieldConditionsService } from './activities/field-conditions/field-conditions.service';
import { WeatherDataController } from './activities/weather-data/weather-data.controller';
import { WeatherDataService } from './activities/weather-data/weather-data.service';

// Phase 3
import { FertilizersController } from './activities/fertilizers/fertilizers.controller';
import { FertilizersService } from './activities/fertilizers/fertilizers.service';
import { IrrigationController } from './activities/irrigation/irrigation.controller';
import { IrrigationService } from './activities/irrigation/irrigation.service';
import { WeedingController } from './activities/weeding/weeding.controller';
import { WeedingService } from './activities/weeding/weeding.service';
import { ChemicalsController } from './activities/chemicals/chemicals.controller';
import { ChemicalsService } from './activities/chemicals/chemicals.service';

// Labour
import { LabourController } from './activities/labour/labour.controller';
import { LabourService } from './activities/labour/labour.service';

// Phase 4
import { DiseasesController } from './activities/diseases/diseases.controller';
import { DiseasesService } from './activities/diseases/diseases.service';
import { PestsController } from './activities/pests/pests.controller';
import { PestsService } from './activities/pests/pests.service';
import { PesticidesController } from './activities/pesticides/pesticides.controller';
import { PesticidesService } from './activities/pesticides/pesticides.service';
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
    // Soil Data Collection
    SoilDataController,
    FieldConditionsController,
    WeatherDataController,
    // Phase 3
    FertilizersController,
    IrrigationController,
    WeedingController,
    ChemicalsController,
    // Labour
    LabourController,
    // Phase 4
    DiseasesController,
    PestsController,
    PesticidesController,
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
    // Soil Data Collection
    SoilDataService,
    FieldConditionsService,
    WeatherDataService,
    // Phase 3
    FertilizersService,
    IrrigationService,
    WeedingService,
    ChemicalsService,
    // Labour
    LabourService,
    // Phase 4
    DiseasesService,
    PestsService,
    PesticidesService,
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
