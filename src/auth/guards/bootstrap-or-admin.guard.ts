import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BootstrapOrAdminGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const adminCount = await this.prisma.admin.count();
    if (adminCount === 0) {
      const expected = this.config.get<string>('ADMIN_BOOTSTRAP_TOKEN');
      if (!expected || req.headers['x-admin-bootstrap-token'] !== expected)
        throw new ForbiddenException(
          'A valid ADMIN_BOOTSTRAP_TOKEN is required to create the first admin',
        );
      return true;
    }
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer '))
      throw new UnauthorizedException('Admin authentication is required');
    try {
      const payload = await this.jwt.verifyAsync(authorization.slice(7));
      if (payload.userType !== 'admin')
        throw new ForbiddenException('Administrator access is required');
      const admin = await this.prisma.admin.findFirst({
        where: { id: payload.sub, isActive: true },
      });
      if (!admin)
        throw new ForbiddenException('Administrator access is required');
      req.user = { id: admin.id, userType: 'admin', roles: ['ADMIN'] };
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Invalid administrator token');
    }
  }
}
