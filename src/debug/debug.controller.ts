import { Controller, Get } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Controller('debug')
export class DebugController {
  constructor(private jwtService: JwtService) {}

  @Get('env')
  checkEnvironment() {
    return {
      nodeEnv: process.env.NODE_ENV,
      jwtSecretExists: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET?.length || 0,
      jwtSecretPreview: process.env.JWT_SECRET?.substring(0, 5) + '...',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('test-jwt')
  testJwt() {
    try {
      const testPayload = { sub: 'test', userType: 'user' };
      const token = this.jwtService.sign(testPayload);
      const decoded = this.jwtService.verify(token);

      return {
        success: true,
        tokenGenerated: !!token,
        tokenLength: token.length,
        decoded,
        message: 'JWT service is working correctly',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'JWT service has issues',
      };
    }
  }
}
