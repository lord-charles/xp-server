import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateGoodsDto } from './create-goods.dto';
import { CreateMachineryDto } from './create-machinery.dto';
import { CreateUtilityDto } from './create-utility.dto';
import { CreateWaterDto } from './create-water.dto';
import { CreatePowerDto } from './create-power.dto';

export class CreateInventoryDto {
  @ApiProperty({
    description: 'Farm ID where the inventory item belongs',
    example: 'cmgxonfdg0001la04pe3e4q18',
  })
  @IsString()
  @IsNotEmpty()
  farmId: string;

  @ApiProperty({
    type: CreateGoodsDto,
    required: false,
    description: 'Add goods/supplies to inventory',
    example: {
      itemName: 'Premium Dairy Feed',
      batchNumber: 'DF-2024-001',
      category: 'Animal Feed',
      quantity: 100,
      unit: 'bags',
      purchasePrice: 3500.0,
      purchaseDate: '2024-12-01T00:00:00.000Z',
      supplier: 'Kenya Feeds Ltd',
      currentLocation: 'Main Store, Section A',
      condition: 'Excellent',
      expirationDate: '2025-06-01T00:00:00.000Z',
      nextInspectionDate: '2025-03-01T00:00:00.000Z',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateGoodsDto)
  goodsInStock?: CreateGoodsDto;

  @ApiProperty({
    type: CreateMachineryDto,
    required: false,
    description: 'Add farm machinery/equipment to inventory',
    example: {
      equipmentName: 'John Deere 5075E Tractor',
      equipmentId: 'JD-5075E-001',
      purchaseDate: '2024-01-15T00:00:00.000Z',
      purchasePrice: 2800000.0,
      machineryLocation: 'Equipment Shed, Bay 1',
      machineryCondition: 'Excellent',
      lastServiceDate: '2024-11-01T00:00:00.000Z',
      nextServiceDate: '2025-05-01T00:00:00.000Z',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateMachineryDto)
  machinery?: CreateMachineryDto;

  @ApiProperty({
    type: CreateUtilityDto,
    required: false,
    description: 'Add farm structures/facilities to inventory',
    example: {
      structureType: 'Modern Dairy Barn',
      structureCapacity: '200 head capacity',
      constructionCost: 4500000.0,
      facilityCondition: 'Excellent',
      utilityLocation: 'North Paddock, Plot A1',
      lastMaintenanceDate: '2024-10-15T00:00:00.000Z',
      nextMaintenanceDate: '2025-04-15T00:00:00.000Z',
      maintenanceCost: 150000.0,
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUtilityDto)
  utility?: CreateUtilityDto;

  @ApiProperty({
    type: CreateWaterDto,
    required: false,
    description: 'Add water systems to inventory',
    example: {
      waterSource: 'Borehole with Submersible Pump',
      waterCapacity: '100,000 liters',
      waterLevel: 85000,
      waterConstructionCost: 850000.0,
      waterLocation: 'East Paddock, Water Point 1',
      waterEntryDate: '2024-03-10T00:00:00.000Z',
      nextInspectionDateWater: '2025-03-10T00:00:00.000Z',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateWaterDto)
  water?: CreateWaterDto;

  @ApiProperty({
    type: CreatePowerDto,
    required: false,
    description: 'Add power systems to inventory',
    example: {
      powerSource: 'Solar Panel System + Grid Backup',
      powerCapacity: '25kW Solar + 15kW Grid',
      powerInstallationCost: 1200000.0,
      powerLocation: 'Main Barn Roof + Utility Room',
      consumptionRate: 18.5,
      consumptionCost: 45000.0,
      lastMaintenanceDatePower: '2024-09-15T00:00:00.000Z',
      nextMaintenanceDatePower: '2025-03-15T00:00:00.000Z',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePowerDto)
  power?: CreatePowerDto;
}
