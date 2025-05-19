import { IsString, IsEmail, IsOptional, IsArray, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum Gender {
  Male = 'Male',
  Female = 'Female',
}

enum Ownership {
  Freehold = 'Freehold',
  Leasehold = 'Leasehold',
  Communal = 'Communal',
}

export class RegisterDto {
  // Farm Details
  @ApiProperty({ description: 'Name of the farm business' })
  @IsString()
  farmName: string;

  @ApiProperty({ description: 'County where the farm is located' })
  @IsString()
  county: string;

  @ApiProperty({ description: 'Administrative location of the farm' })
  @IsString()
  administrativeLocation: string;

  @ApiProperty({ description: 'Size of the farm in acres' })
  @IsNumber()
  farmSize: number;

  @ApiProperty({
    enum: Ownership,
    description: 'Type of farm ownership'
  })
  @IsEnum(Ownership)
  ownership: Ownership;

  @ApiProperty({
    type: [String],
    description: 'Types of farming activities',
    example: ['Dairy cattle', 'Poultry', 'Crops']
  })
  @IsArray()
  @IsString({ each: true })
  farmingTypes: string[];

  // Personal Information
  @ApiProperty({ description: 'First name of the farmer' })
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ description: 'Middle name of the farmer' })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiProperty({ description: 'Last name of the farmer' })
  @IsString()
  lastName: string;

  @ApiProperty({
    enum: Gender,
    description: 'Gender of the farmer'
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    description: 'Date of birth of the farmer',
    example: '2000-01-01'
  })
  @IsString()
  dob: string;

  @ApiProperty({ description: 'County of residence' })
  @IsString()
  residenceCounty: string;

  @ApiPropertyOptional({ description: 'Specific location of residence' })
  @IsString()
  @IsOptional()
  residenceLocation?: string;

  // Professional Information
  @ApiPropertyOptional({
    description: 'Years of farming experience',
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'farmer@example.com'
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+254700000000'
  })
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'Business contact number',
    example: '+254700000000'
  })
  @IsString()
  @IsOptional()
  businessNumber?: string;

  @ApiProperty({
    description: '4-digit PIN',
    minLength: 4,
    maxLength: 4,
    example: '1234'
  })
  @IsString()
  pin: string;
}
