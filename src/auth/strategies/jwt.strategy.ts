import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    const userType = payload.userType || 'user';

    if (userType === 'user') {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          deletedAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.deletedAt) {
        throw new UnauthorizedException('This account has been deleted');
      }

      const { deletedAt, ...userWithoutDeletedAt } = user;
      return { ...userWithoutDeletedAt, userType: 'user' };
    } else if (userType === 'employee') {
      const employee = await this.prisma.employee.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          employeeType: true,
          deletedAt: true,
        },
      });

      if (!employee) {
        throw new UnauthorizedException('Employee not found');
      }

      if (employee.deletedAt) {
        throw new UnauthorizedException('This account has been deleted');
      }

      const { deletedAt, ...employeeWithoutDeletedAt } = employee;
      return { ...employeeWithoutDeletedAt, userType: 'employee' };
    } else if (userType === 'admin') {
      const admin = await this.prisma.admin.findUnique({ where: { id: payload.sub }, select: { id: true, firstName: true, lastName: true, email: true, isActive: true } });
      if (!admin || !admin.isActive) throw new UnauthorizedException('Administrator not found or inactive');
      return { id: admin.id, firstName: admin.firstName, lastName: admin.lastName, email: admin.email, userType: 'admin', roles: ['ADMIN'] };
    }

    throw new UnauthorizedException('Invalid user type');
  }
}
