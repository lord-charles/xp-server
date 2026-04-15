import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';

@Injectable()
export class CyclesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCycleDto) {
    if (dto.landSelection === 'input' && !dto.landSize) {
      throw new BadRequestException(
        'landSize is required when landSelection is "input"',
      );
    }

    const farm = await this.prisma.farm.findUnique({
      where: { id: dto.farmId },
    });
    if (!farm) throw new NotFoundException(`Farm ${dto.farmId} not found`);

    return this.prisma.cropCycle.create({
      data: {
        farmId: dto.farmId,
        name: dto.name,
        startDate: dto.startDate,
        endDate: dto.endDate,
        landSelection: dto.landSelection,
        landSize: dto.landSelection === 'entire' ? farm.size : dto.landSize,
        landUnit: dto.landUnit ?? 'acres',
        status: 'Active',
      },
    });
  }

  async findAll(farmId: string) {
    const farm = await this.prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) throw new NotFoundException(`Farm ${farmId} not found`);

    const cycles = await this.prisma.cropCycle.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
      include: {
        crops: {
          select: { id: true, status: true, areaSize: true, progress: true },
        },
      },
    });

    return cycles.map((c) => this._withStats(c));
  }

  async findOne(id: string) {
    const cycle = await this.prisma.cropCycle.findUnique({
      where: { id },
      include: { crops: true },
    });
    if (!cycle) throw new NotFoundException(`Cycle ${id} not found`);
    return this._withStats(cycle);
  }

  async update(id: string, dto: UpdateCycleDto) {
    await this._findOrFail(id);
    return this.prisma.cropCycle.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.cropCycle.delete({ where: { id } });
    return { message: 'Cycle deleted successfully' };
  }

  // ── private ───────────────────────────────────────────────────────────────

  private async _findOrFail(id: string) {
    const cycle = await this.prisma.cropCycle.findUnique({ where: { id } });
    if (!cycle) throw new NotFoundException(`Cycle ${id} not found`);
    return cycle;
  }

  private _withStats(cycle: any) {
    const crops: any[] = cycle.crops ?? [];
    const activeCount = crops.filter((c) => c.status === 'Active').length;
    const completeCount = crops.filter((c) => c.status === 'Complete').length;
    const totalAcres = +crops
      .reduce((s: number, c: any) => s + (c.areaSize ?? 0), 0)
      .toFixed(2);
    const avgProgress =
      crops.length > 0
        ? Math.round(
            crops.reduce((s: number, c: any) => s + (c.progress ?? 0), 0) /
              crops.length,
          )
        : 0;

    const { crops: _dropped, ...rest } = cycle;
    return {
      ...rest,
      stats: {
        activeCount,
        completeCount,
        totalCrops: crops.length,
        totalAcres,
        avgProgress,
      },
    };
  }
}
