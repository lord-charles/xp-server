import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LoggerService } from './services/logger.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { JwtDebugInterceptor } from './interceptors/jwt-debug.interceptor';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
    }),
  ],
  providers: [LoggerService, LoggingInterceptor, JwtDebugInterceptor],
  exports: [LoggerService, LoggingInterceptor, JwtDebugInterceptor],
})
export class CommonModule {}
