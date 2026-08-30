import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/reset-password.dto';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../notifications/notifications.service';
import { User, UserWithoutPin } from './types/user.type';
import { Employee, EmployeeWithoutPin } from './types/employee.type';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../prisma/generated/prisma/client';
import { BillingService } from '../billing/billing.service';
import { AdminLoginDto, CreateAdminDto } from './dto/admin.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
    private billingService: BillingService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ user: UserWithoutPin; message: string }> {
    // Check if phone number already exists
    const existingPhone = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (existingPhone) {
      throw new BadRequestException(
        'Phone number already exists, login instead',
      );
    }

    const existingNationalId = await this.prisma.user.findUnique({
      where: { nationalId: dto.nationalId },
    });

    if (existingNationalId) {
      throw new BadRequestException(
        'National ID already exists, login instead',
      );
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
    const user = (await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        middleName: dto.middleName,
        lastName: dto.lastName,
        gender: dto.gender,
        dob: dto.dob,
        residenceCounty: dto.residenceCounty,
        residenceLocation: dto.residenceLocation,
        constituency: dto.constituency,
        residenceConstituency: dto.residenceConstituency,
        nationalId: dto.nationalId,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        businessNumber: dto.businessNumber,
        pin: hashedPin,
        yearsOfExperience: dto.yearsOfExperience,
        otp,
        otpExpiry,
        isVerified: false,
        farms: {
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
    })) as User;

    // Every confirmed setup gets a billing identity and an invoice with the
    // configured trial due date. The billing seed is create-only and never
    // overwrites admin changes.
    await this.billingService.createAccountForUser(user.id, user.farms[0].id);

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

  async login(dto: LoginDto): Promise<{
    user: UserWithoutPin | EmployeeWithoutPin;
    token?: string;
    message?: string;
    userType: 'user' | 'employee';
  }> {
    // First try to find user
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
      include: {
        farms: true,
      },
    });

    if (user) {
      // Check if user is soft deleted
      if (user.deletedAt) {
        throw new UnauthorizedException('This account has been deleted');
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
          userType: 'user',
          message: 'Account not verified. OTP has been resent to your phone.',
        };
      }

      const { pin, ...result } = user;
      return {
        user: result,
        userType: 'user',
        token: await this.generateToken(user.id, 'user'),
      };
    }

    // If user not found, try to find employee
    const employee = await this.prisma.employee.findUnique({
      where: { phone: dto.phoneNumber },
      include: {
        farms: {
          include: {
            farm: true,
          },
        },
        benefits: true,
      },
    });

    if (!employee || !employee.pin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if employee is soft deleted
    if (employee.deletedAt) {
      throw new UnauthorizedException('This account has been deleted');
    }

    const isValidPin = await bcrypt.compare(dto.pin, employee.pin);
    if (!isValidPin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!employee?.isVerified) {
      const otp = this.notificationsService.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await this.prisma.employee.update({
        where: { id: employee.id },
        data: { otp, otpExpiry },
      });
      await this.notificationsService.sendSMS(
        employee.phone,
        `Your XpertFarmer verification code is: ${otp}. Valid for 10 minutes.`,
      );
      const { pin, ...employeeWithoutPin } = employee;
      return {
        user: employeeWithoutPin,
        userType: 'employee',
        message: 'Account not verified. OTP has been resent to your phone.',
      };
    }

    const { pin, ...result } = employee;
    return {
      user: result,
      userType: 'employee',
      token: await this.generateToken(employee.id, 'employee'),
    };
  }

  private async generateToken(
    userId: string,
    userType: 'user' | 'employee' | 'admin',
  ): Promise<string> {
    return this.jwtService.signAsync({ sub: userId, userType });
  }

  async createAdmin(dto: CreateAdminDto) {
    const existing = await this.prisma.admin.findFirst({ where: { OR: [{ email: dto.email }, ...(dto.phoneNumber ? [{ phoneNumber: dto.phoneNumber }] : [])] } });
    if (existing) throw new BadRequestException('An administrator with these details already exists');
    const admin = await this.prisma.admin.create({ data: { firstName: dto.firstName, lastName: dto.lastName, email: dto.email.toLowerCase(), phoneNumber: dto.phoneNumber, passwordHash: await bcrypt.hash(dto.password, 12) } });
    return { id: admin.id, firstName: admin.firstName, lastName: admin.lastName, email: admin.email, phoneNumber: admin.phoneNumber, role: 'ADMIN' };
  }

  async loginAdmin(dto: AdminLoginDto) {
    const identifier = dto.identifier.toLowerCase();
    const admin = await this.prisma.admin.findFirst({ where: { isActive: true, OR: [{ email: identifier }, { phoneNumber: dto.identifier }] } });
    if (!admin || !(await bcrypt.compare(dto.password, admin.passwordHash))) throw new UnauthorizedException('Invalid administrator credentials');
    await this.prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
    return { user: { id: admin.id, firstName: admin.firstName, lastName: admin.lastName, email: admin.email, phoneNumber: admin.phoneNumber, role: 'ADMIN' }, userType: 'admin', token: await this.generateToken(admin.id, 'admin') };
  }

  async requestPasswordReset(
    dto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    // First try to find user
    const user = (await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
      include: {
        farms: true,
      },
    })) as User;

    if (user) {
      const otp = this.notificationsService.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          otp: otp,
          otpExpiry: otpExpiry,
        } as Prisma.XOR<
          Prisma.UserUpdateInput,
          Prisma.UserUncheckedUpdateInput
        >,
      });

      const success = await this.notificationsService.sendSMS(
        user.phoneNumber,
        `Your XpertFarmer password reset code is: ${otp}. Valid for 10 minutes.`,
      );

      if (!success) {
        throw new BadRequestException('Failed to send OTP');
      }

      return { message: 'OTP sent successfully' };
    }

    // If user not found, try to find employee
    const employee = await this.prisma.employee.findUnique({
      where: { phone: dto.phoneNumber },
      include: {
        farms: {
          include: {
            farm: true,
          },
        },
        benefits: true,
      },
    });

    if (!employee || !employee.pin) {
      throw new UnauthorizedException(
        'Account not found or not set up for authentication',
      );
    }

    const otp = this.notificationsService.generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.employee.update({
      where: { id: employee.id },
      data: {
        otp: otp,
        otpExpiry: otpExpiry,
      },
    });

    const success = await this.notificationsService.sendSMS(
      employee.phone,
      `Your XpertFarmer password reset code is: ${otp}. Valid for 10 minutes.`,
    );

    if (!success) {
      throw new BadRequestException('Failed to send OTP');
    }

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ message: string }> {
    // First try to find user
    const user = (await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
      include: {
        farms: true,
      },
    })) as User;

    if (user && user.otp && user.otpExpiry) {
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
        } as Prisma.XOR<
          Prisma.UserUpdateInput,
          Prisma.UserUncheckedUpdateInput
        >,
      });

      return { message: 'OTP verified successfully' };
    }

    // If user not found or doesn't have OTP, try employee
    const employee = await this.prisma.employee.findUnique({
      where: { phone: dto.phoneNumber },
    });

    if (!employee || !employee.otp || !employee.otpExpiry) {
      throw new UnauthorizedException('Invalid OTP request');
    }

    const otpExpiry = employee.otpExpiry as Date;

    if (new Date() > otpExpiry) {
      throw new UnauthorizedException('OTP has expired');
    }

    if (employee.otp !== dto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.prisma.employee.update({
      where: { id: employee.id },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null,
      },
    });

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    // First try to find user
    const user = (await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
      include: {
        farms: true,
      },
    })) as User;

    if (user && user.otp && user.otpExpiry) {
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
        } as Prisma.XOR<
          Prisma.UserUpdateInput,
          Prisma.UserUncheckedUpdateInput
        >,
      });

      return { message: 'Password reset successful' };
    }

    // If user not found or doesn't have OTP, try employee
    const employee = await this.prisma.employee.findUnique({
      where: { phone: dto.phoneNumber },
    });

    if (!employee || !employee.otp || !employee.otpExpiry) {
      throw new UnauthorizedException('Invalid reset request');
    }

    const otpExpiry = employee.otpExpiry as Date;

    if (new Date() > otpExpiry) {
      throw new UnauthorizedException('Reset code has expired');
    }

    if (employee.otp !== dto.otp) {
      throw new UnauthorizedException('Invalid reset code');
    }

    if (!dto.newPin || typeof dto.newPin !== 'string' || !dto.newPin.trim()) {
      throw new BadRequestException('New PIN is required');
    }

    const hashedPin = await bcrypt.hash(dto.newPin, 10);

    await this.prisma.employee.update({
      where: { id: employee.id },
      data: {
        pin: hashedPin,
        otp: null,
        otpExpiry: null,
      },
    });

    return { message: 'Password reset successful' };
  }

  async deleteAccount(userId: string): Promise<{ message: string }> {
    // Try to find and soft delete user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() },
      });
      return { message: 'Account deleted successfully' };
    }

    // If not a user, try to find and soft delete employee
    const employee = await this.prisma.employee.findUnique({
      where: { id: userId },
    });

    if (!employee) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.employee.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Account deleted successfully' };
  }
}
