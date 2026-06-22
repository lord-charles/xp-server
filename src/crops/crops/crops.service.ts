import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';

type SortOption = 'name' | 'progress' | 'area' | 'harvest';
type StatusFilter = 'All' | 'Active' | 'Complete';

@Injectable()
export class CropsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCropDto) {
    const cycle = await this.prisma.cropCycle.findUnique({
      where: { id: dto.cycleId },
    });
    if (!cycle) throw new NotFoundException(`Cycle ${dto.cycleId} not found`);

    return this.prisma.crop.create({
      data: {
        cycleId: dto.cycleId,
        farmId: dto.farmId,
        cropName: dto.cropName,
        category: dto.category,
        variety: dto.variety,
        areaSize: dto.areaSize ?? 0,
        areaUnit: dto.areaUnit ?? 'acres',
        plantingDate:
          dto.plantingDate ?? new Date().toLocaleDateString('en-GB'),
        expectedHarvestDate: dto.expectedHarvestDate ?? '',
        icon: dto.icon,
        color: dto.color,
        currentActivity: dto.currentActivity ?? 'Land Preparation',
        progress: dto.progress ?? 0,
        status: 'Active',
        notes: dto.notes,
      },
    });
  }

  async findAll(params: {
    cycleId: string;
    farmId?: string;
    status?: StatusFilter;
    search?: string;
    sortBy?: SortOption;
    page?: number;
    limit?: number;
  }) {
    const {
      cycleId,
      farmId,
      status,
      search,
      sortBy = 'name',
      page = 1,
      limit = 4,
    } = params;

    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const limitNum = Number(limit) > 0 ? Number(limit) : 4;
    const skip = (pageNum - 1) * limitNum;

    const where: any = { cycleId };
    if (farmId) where.farmId = farmId;
    if (status && status !== 'All') where.status = status;
    if (search) {
      where.OR = [
        { cropName: { contains: search, mode: 'insensitive' } },
        { variety: { contains: search, mode: 'insensitive' } },
        { currentActivity: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Prisma orderBy for supported fields; progress/area sorted in-memory
    const orderBy: any =
      sortBy === 'name'
        ? { cropName: 'asc' }
        : sortBy === 'harvest'
          ? { expectedHarvestDate: 'asc' }
          : { createdAt: 'desc' };

    const [crops, total] = await Promise.all([
      this.prisma.crop.findMany({ where, orderBy }),
      this.prisma.crop.count({ where }),
    ]);

    // In-memory sort for progress / area
    if (sortBy === 'progress') crops.sort((a, b) => b.progress - a.progress);
    if (sortBy === 'area') crops.sort((a, b) => b.areaSize - a.areaSize);

    const paginated = crops.slice(skip, skip + limitNum);
    const pages = Math.max(1, Math.ceil(total / limitNum));

    return {
      data: paginated,
      meta: {
        total,
        page: pageNum,
        pages,
        hasNextPage: pageNum < pages,
        hasPrevPage: pageNum > 1,
      },
    };
  }

  async findOne(id: string) {
    const crop = await this.prisma.crop.findUnique({ where: { id } });
    if (!crop) throw new NotFoundException(`Crop ${id} not found`);
    return crop;
  }

  async update(id: string, dto: UpdateCropDto) {
    await this._findOrFail(id);
    return this.prisma.crop.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.crop.delete({ where: { id } });
    return { message: 'Crop deleted successfully' };
  }

  // ── private ───────────────────────────────────────────────────────────────

  private async _findOrFail(id: string) {
    const crop = await this.prisma.crop.findUnique({ where: { id } });
    if (!crop) throw new NotFoundException(`Crop ${id} not found`);
    return crop;
  }
}
