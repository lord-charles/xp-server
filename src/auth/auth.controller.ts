import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/reset-password.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { UserWithoutPin } from './types/user.type';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminLoginDto, CreateAdminDto } from './dto/admin.dto';
import { BootstrapOrAdminGuard } from './guards/bootstrap-or-admin.guard';

@ApiTags('auth')
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register a new farmer',
    description: 'Creates a new farmer account with farm details',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      'Kenyan Farmer': {
        summary: 'Typical Kenyan farmer registration',
        value: {
          // Farm Details
          farmName: 'Kamau Mixed Farm',
          county: 'Kiambu',
          administrativeLocation: 'Kikuyu',
          farmSize: 5.5,
          ownership: 'Freehold',
          farmingTypes: ['Dairy cattle', 'Poultry', 'Crops'],

          // Personal Information
          firstName: 'Mwangi',
          middleName: 'Kamau',
          lastName: 'Kariuki',
          gender: 'Male',
          dob: '2000-01-01',
          residenceCounty: 'Kiambu',
          residenceLocation: 'Kikuyu Town',
          constituency: 'Kikuyu',
          residenceConstituency: 'Kikuyu',
          nationalId: '123456789',

          // Professional Information
          yearsOfExperience: 8,
          email: 'mwangi.kamau@example.com',
          phoneNumber: '+254712345678',
          businessNumber: '+254720123456',
          pin: '1234',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Farmer successfully registered',
    schema: {
      type: 'object',
      example: {
        user: {
          id: 'clh2x0f380000mk08g8hv1q2z',
          firstName: 'Mwangi',
          middleName: 'Kamau',
          lastName: 'Kariuki',
          gender: 'Male',
          ageGroup: '35-44',
          residenceCounty: 'Kiambu',
          residenceLocation: 'Kikuyu Town',
          email: 'mwangi.kamau@example.com',
          phoneNumber: '+254712345678',
          businessNumber: '+254720123456',
          yearsOfExperience: 8,
          createdAt: '2025-05-07T17:46:51.000Z',
          updatedAt: '2025-05-07T17:46:51.000Z',
          farm: {
            id: 'clh2x0f380001mk08x7v2p4m1',
            name: 'Kamau Mixed Farm',
            county: 'Kiambu',
            administrativeLocation: 'Kikuyu',
            size: 5.5,
            ownership: 'Freehold',
            farmingTypes: ['Dairy cattle', 'Poultry', 'Crops'],
          },
        },
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbGgyeDBmMzgwMDAwbWswOGc4aHYxcTJ6IiwiaWF0IjoxNzA5ODM0ODExLCJleHAiOjE3MTA0Mzk2MTF9...',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Phone number already registered',
  })
  async register(
    @Body() dto: RegisterDto,
  ): Promise<{ user: UserWithoutPin; message: string }> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({
    type: LoginDto,
    examples: {
      'Kenyan Farmer Login': {
        summary: 'Standard Kenyan farmer login',
        value: {
          phoneNumber: '+254712345678',
          pin: '1234',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('admin/login')
  @ApiOperation({
    summary: 'Log in to the XpertFarmer administration dashboard',
  })
  @ApiBody({ type: AdminLoginDto })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        user: {
          id: 'cm1admin',
          firstName: 'Jane',
          lastName: 'Admin',
          email: 'jane.admin@xpertfarmer.com',
          role: 'ADMIN',
        },
        userType: 'admin',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  async adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.loginAdmin(dto);
  }

  @Public()
  @UseGuards(BootstrapOrAdminGuard)
  @Post('admins')
  @ApiOperation({
    summary:
      'Create an administrator. The first administrator requires ADMIN_BOOTSTRAP_TOKEN.',
  })
  @ApiHeader({
    name: 'x-admin-bootstrap-token',
    required: true,
    description:
      'Required only while creating the first admin. Must exactly match ADMIN_BOOTSTRAP_TOKEN in the server environment.',
    example: 'your-one-time-bootstrap-secret',
  })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        id: 'cm1admin',
        firstName: 'Jane',
        lastName: 'Admin',
        email: 'jane.admin@xpertfarmer.com',
        phoneNumber: '254712345678',
        role: 'ADMIN',
      },
    },
  })
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.authService.createAdmin(dto);
  }

  @Public()
  @Post('request-reset')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({
    type: RequestPasswordResetDto,
    examples: {
      'Request Password Reset': {
        summary: 'Request password reset',
        value: {
          phoneNumber: '+254712345678',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'OTP sent successfully' })
  @ApiResponse({ status: 401, description: 'User not found' })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Public()
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiBody({
    type: VerifyOtpDto,
    examples: {
      'Verify OTP': {
        summary: 'Verify OTP',
        value: {
          phoneNumber: '+254712345678',
          otp: '123456',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'OTP verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with OTP' })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      'Reset Password': {
        summary: 'Reset password',
        value: {
          phoneNumber: '+254712345678',
          otp: '123456',
          newPin: '1234',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Password reset successful' })
  @ApiResponse({ status: 401, description: 'Invalid reset code' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('delete-account')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete user account',
    description:
      'Delete the authenticated user account (compliant with Apple requirements). Requires JWT authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    schema: {
      type: 'object',
      example: {
        message: 'Account deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteAccount(@Req() req: any) {
    return this.authService.deleteAccount(req.user.id);
  }
}
