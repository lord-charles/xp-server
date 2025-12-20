import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DebugController } from './debug.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
    }),
  ],
  controllers: [DebugController],
})
export class DebugModule {}
