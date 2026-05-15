import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCropAlertDto } from './dto/create-crop-alert.dto';
import { UpdateCropAlertDto } from './dto/update-crop-alert.dto';

@Injectable()
export class CropAlertsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCropAlertDto) {
    await this._assertCropExists(dto.cropId);

    const record = await this.prisma.cropAlert.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        alertType: dto.alertType,
        message: dto.message,
        severity: dto.severity || 'info',
        isRead: dto.isRead || false,
      },
    });

    return record;
  }

  async findAll(cropId: string) {
    await this._assertCropExists(cropId);

    const records = await this.prisma.cropAlert.findMany({
      where: { cropId },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = records.filter((r) => !r.isRead).length;
    const criticalCount = records.filter(
      (r) => r.severity === 'critical' && !r.isRead,
    ).length;

    return {
      records,
      stats: {
        count: records.length,
        unreadCount,
        criticalCount,
      },
    };
  }

  async findOne(id: string) {
    return this._findOrFail(id);
  }

  async update(id: string, dto: UpdateCropAlertDto) {
    await this._findOrFail(id);
    return this.prisma.cropAlert.update({
      where: { id },
      data: {
        alertType: dto.alertType,
        message: dto.message,
        severity: dto.severity,
        isRead: dto.isRead,
      },
    });
  }

  async markAsRead(id: string) {
    await this._findOrFail(id);
    return this.prisma.cropAlert.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(cropId: string) {
    await this._assertCropExists(cropId);
    return this.prisma.cropAlert.updateMany({
      where: { cropId },
      data: { isRead: true },
    });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.cropAlert.delete({ where: { id } });
    return { message: 'Crop alert deleted successfully' };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private async _findOrFail(id: string) {
    const record = await this.prisma.cropAlert.findUnique({
      where: { id },
    });
    if (!record) throw new NotFoundException(`Crop alert ${id} not found`);
    return record;
  }

  private async _assertCropExists(cropId: string) {
    const crop = await this.prisma.crop.findUnique({ where: { id: cropId } });
    if (!crop) throw new NotFoundException(`Crop ${cropId} not found`);
  }
}
