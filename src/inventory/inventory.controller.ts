import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateGoodsDto } from './dto/update-goods.dto';
import { UpdateMachineryDto } from './dto/update-machinery.dto';
import { UpdateUtilityDto } from './dto/update-utility.dto';
import { UpdateWaterDto } from './dto/update-water.dto';
import { UpdatePowerDto } from './dto/update-power.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inventory item' })
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory items for a farm' })
  @ApiQuery({ name: 'farmId', required: true, type: String })
  findAll(@Query('farmId') farmId: string) {
    return this.inventoryService.findAll(farmId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific inventory record' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch('goods/:id')
  @ApiOperation({ summary: 'Update a goods in stock item' })
  updateGoods(@Param('id') id: string, @Body() updateGoodsDto: UpdateGoodsDto) {
    return this.inventoryService.update(id, 'goods', updateGoodsDto);
  }

  @Patch('machinery/:id')
  @ApiOperation({ summary: 'Update a machinery item' })
  updateMachinery(
    @Param('id') id: string,
    @Body() updateMachineryDto: UpdateMachineryDto,
  ) {
    return this.inventoryService.update(id, 'machinery', updateMachineryDto);
  }

  @Patch('utility/:id')
  @ApiOperation({ summary: 'Update a utility item' })
  updateUtility(
    @Param('id') id: string,
    @Body() updateUtilityDto: UpdateUtilityDto,
  ) {
    return this.inventoryService.update(id, 'utility', updateUtilityDto);
  }

  @Delete('goods/:id')
  @ApiOperation({ summary: 'Delete a goods in stock item' })
  removeGoods(@Param('id') id: string) {
    return this.inventoryService.remove(id, 'goods');
  }

  @Delete('machinery/:id')
  @ApiOperation({ summary: 'Delete a machinery item' })
  removeMachinery(@Param('id') id: string) {
    return this.inventoryService.remove(id, 'machinery');
  }

  @Delete('utility/:id')
  @ApiOperation({ summary: 'Delete a utility item' })
  removeUtility(@Param('id') id: string) {
    return this.inventoryService.remove(id, 'utility');
  }

  @Patch('water/:id')
  @ApiOperation({ summary: 'Update a water system item' })
  updateWater(@Param('id') id: string, @Body() updateWaterDto: UpdateWaterDto) {
    return this.inventoryService.update(id, 'water', updateWaterDto);
  }

  @Delete('water/:id')
  @ApiOperation({ summary: 'Delete a water system item' })
  removeWater(@Param('id') id: string) {
    return this.inventoryService.remove(id, 'water');
  }

  @Patch('power/:id')
  @ApiOperation({ summary: 'Update a power system item' })
  updatePower(@Param('id') id: string, @Body() updatePowerDto: UpdatePowerDto) {
    return this.inventoryService.update(id, 'power', updatePowerDto);
  }

  @Delete('power/:id')
  @ApiOperation({ summary: 'Delete a power system item' })
  removePower(@Param('id') id: string) {
    return this.inventoryService.remove(id, 'power');
  }
}
