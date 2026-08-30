import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  firstName: string;
  @ApiProperty({ example: 'Admin' })
  @IsString()
  lastName: string;
  @ApiProperty({ example: 'jane.admin@xpertfarmer.com' })
  @IsEmail()
  email: string;
  @ApiPropertyOptional({ example: '254712345678' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
  @ApiProperty({ example: 'ChangeThisAdminPassword123!' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class AdminLoginDto {
  @ApiProperty({
    example: 'jane.admin@xpertfarmer.com',
    description: 'Administrator email or phone number.',
  })
  @IsString()
  identifier: string;
  @ApiProperty({ example: 'ChangeThisAdminPassword123!' })
  @IsString()
  password: string;
}
