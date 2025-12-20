import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { throwError } from 'rxjs';

@Injectable()
export class JwtDebugInterceptor implements NestInterceptor {
  private readonly logger = new Logger(JwtDebugInterceptor.name);

  constructor(private jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, headers } = request;
    const authorization = headers['authorization'];

    // Only debug protected routes (skip public routes like login)
    if (url.includes('/auth/login') || url.includes('/auth/register')) {
      return next.handle();
    }

    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.substring(7);

      try {
        // Decode without verification to see payload
        const decoded = this.jwtService.decode(token);
        this.logger.debug(`JWT Debug - ${method} ${url}`);
        this.logger.debug(`Token payload: ${JSON.stringify(decoded, null, 2)}`);

        // Check if token is expired
        if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
          const now = Math.floor(Date.now() / 1000);
          const isExpired = decoded.exp < now;
          this.logger.debug(
            `Token expired: ${isExpired} (exp: ${decoded.exp}, now: ${now})`,
          );
        }

        // Verify token with secret
        const verified = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'your-secret-key',
        });
        this.logger.debug(`Token verification: SUCCESS`);
      } catch (error) {
        this.logger.error(
          `JWT Debug - Token verification failed: ${error.message}`,
        );
        this.logger.error(`Token: ${token.substring(0, 50)}...`);
        this.logger.error(`JWT_SECRET exists: ${!!process.env.JWT_SECRET}`);
      }
    } else {
      this.logger.debug(
        `JWT Debug - ${method} ${url} - No authorization header`,
      );
    }

    return next.handle().pipe(
      catchError((error) => {
        if (error.status === 401) {
          this.logger.error(`JWT Debug - 401 Unauthorized on ${method} ${url}`);
          this.logger.error(`Error message: ${error.message}`);
        }
        return throwError(() => error);
      }),
    );
  }
}
