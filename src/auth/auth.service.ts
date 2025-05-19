import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto, ResetPasswordDto, VerifyOtpDto } from './dto/reset-password.dto';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../notifications/notifications.service';
import { User, UserWithoutPin } from './types/user.type';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../prisma/generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) { }

  async register(dto: RegisterDto): Promise<{ user: UserWithoutPin; message: string }> {
    // Check if phone number already exists
    const existingPhone = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (existingPhone) {
      throw new BadRequestException('Phone number already exists, login instead');
    }

    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new BadRequestException('Email already exists, login instead');
    }

    const hashedPin = await bcrypt.hash(dto.pin, 10);
    const otp = this.notificationsService.generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with validated data
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        middleName: dto.middleName,
        lastName: dto.lastName,
        gender: dto.gender,
        dob: dto.dob,
        residenceCounty: dto.residenceCounty,
        residenceLocation: dto.residenceLocation,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        businessNumber: dto.businessNumber,
        pin: hashedPin,
        yearsOfExperience: dto.yearsOfExperience,
        otp,
        otpExpiry,
        isVerified: false,
        farm: {
          create: {
            name: dto.farmName,
            county: dto.county,
            administrativeLocation: dto.administrativeLocation,
            size: dto.farmSize,
            ownership: dto.ownership,
            farmingTypes: dto.farmingTypes,
          },
        },
      } as Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>,
      include: {
        farms: true,
      },
    }) as User;

    const { pin, ...result } = user;

    // Send OTP via SMS
    const success = await this.notificationsService.sendSMS(
      user.phoneNumber,
      `Your XpertFarmer verification code is: ${otp}. Valid for 10 minutes.`,
    );

    if (!success) {
      // If SMS fails, delete the user and throw error
      await this.prisma.user.delete({ where: { id: user.id } });
      throw new BadRequestException('Failed to send verification OTP');
    }

    return {
      user: result,
      message: 'Please verify your account with the OTP sent to your phone',
    };
  }

  async login(dto: LoginDto): Promise<{ user: UserWithoutPin; token?: string; message?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
      include: {
        farms: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPin = await bcrypt.compare(dto.pin, user.pin);
    if (!isValidPin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user?.isVerified) {
      const otp = this.notificationsService.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { otp, otpExpiry } as Prisma.UserUpdateInput,
      });
      await this.notificationsService.sendSMS(
        user.phoneNumber,
        `Your XpertFarmer verification code is: ${otp}. Valid for 10 minutes.`,
      );
      const { pin, ...userWithoutPin } = user;
      return {
        user: userWithoutPin,
        message: 'Account not verified. OTP has been resent to your phone.'
      };
    }

    const { pin, ...result } = user;
    return {
      user: result,
      token: await this.generateToken(user.id),
    };
  }

  private async generateToken(userId: string): Promise<string> {
    return this.jwtService.signAsync({ sub: userId });
  }

  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
      include: {
        farms: true,
      },
    }) as User;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const otp = this.notificationsService.generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otp: otp,
        otpExpiry: otpExpiry,
      } as Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>,
      include: {
        farms: true,
      },
    }) as User;

    const success = await this.notificationsService.sendSMS(
      user.phoneNumber,
      `Your XpertFarmer password reset code is: ${otp}. Valid for 10 minutes.`,
    );

    if (!success) {
      throw new BadRequestException('Failed to send OTP');
    }

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
      include: {
        farms: true,
      },
    }) as User;

    if (!user || !user.otp || !user.otpExpiry) {
      throw new UnauthorizedException('Invalid OTP request');
    }

    const otpExpiry = user.otpExpiry as Date;

    if (new Date() > otpExpiry) {
      throw new UnauthorizedException('OTP has expired');
    }

    if (user.otp !== dto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null,
      } as Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>,
      include: {
        farms: true,
      },
    }) as User;

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
      include: {
        farms: true,
      },
    }) as User;

    if (!user || !user.otp || !user.otpExpiry) {
      throw new UnauthorizedException('Invalid reset request');
    }

    const otpExpiry = user.otpExpiry as Date;

    if (new Date() > otpExpiry) {
      throw new UnauthorizedException('Reset code has expired');
    }

    if (user.otp !== dto.otp) {
      throw new UnauthorizedException('Invalid reset code');
    }

    if (!dto.newPin || typeof dto.newPin !== 'string' || !dto.newPin.trim()) {
      throw new BadRequestException('New PIN is required');
    }

    const hashedPin = await bcrypt.hash(dto.newPin, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        pin: hashedPin,
        otp: null,
        otpExpiry: null,
      } as Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>,
      include: {
        farms: true,
      },
    }) as User;

    return { message: 'Password reset successful' };
  }
}
