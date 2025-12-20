import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const authorization = headers['authorization'] || '';
    const startTime = Date.now();

    // Log incoming request with auth info
    const authInfo = authorization
      ? `Auth: Bearer ${authorization.substring(7, 20)}...`
      : 'Auth: None';

    this.logger.log(
      `Incoming Request: ${method} ${url} - IP: ${ip} - ${authInfo} - User Agent: ${userAgent}`,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          this.logger.log(
            `Outgoing Response: ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          this.logger.error(
            `Request Error: ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
