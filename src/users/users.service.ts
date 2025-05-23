import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll(page = 1, limit = 10, search?: string) {
    page = Number(page) > 0 ? Number(page) : 1;
    limit = Number(limit) > 0 ? Number(limit) : 10;
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phoneNumber: { contains: search } },
      ],
    } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where,
        include: {
          farms: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data: users.map(({ pin, ...user }) => user),
      meta: {
        total,
        page,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        farms: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { pin, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        include: {
          farms: true,
        },
      });
      const { pin, ...result } = updatedUser;
      return result;
    } catch (error) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('email')) {
          throw new ConflictException('Email is already in use by another user.');
        }
        if (error.meta?.target?.includes('phoneNumber')) {
          throw new ConflictException('Phone number is already in use by another user.');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}
