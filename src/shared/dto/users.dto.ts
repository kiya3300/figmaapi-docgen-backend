import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsString, 
  IsOptional, 
  MinLength, 
  MaxLength, 
  IsUUID,
  IsEnum,
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export enum UserPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email?: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Avatar URL must be a string' })
  @MaxLength(500, { message: 'Avatar URL must not exceed 500 characters' })
  avatarUrl?: string;

  @ApiProperty({
    description: 'User bio',
    example: 'Full-stack developer passionate about creating amazing products',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
  bio?: string;
}

export class InviteTeamMemberDto {
  @ApiProperty({
    description: 'Email address of the person to invite',
    example: 'newmember@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'Role to assign to the team member',
    enum: UserRole,
    example: UserRole.MEMBER,
  })
  @IsEnum(UserRole, { message: 'Invalid role specified' })
  role: UserRole;

  @ApiProperty({
    description: 'Personal message to include in the invitation',
    example: 'Welcome to our team! We\'re excited to have you on board.',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Message must be a string' })
  @MaxLength(1000, { message: 'Message must not exceed 1000 characters' })
  message?: string;
}

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'User bio',
    example: 'Full-stack developer passionate about creating amazing products',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    description: 'User subscription plan',
    enum: UserPlan,
    example: UserPlan.PRO,
  })
  plan: UserPlan;

  @ApiProperty({
    description: 'Whether email is verified',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last profile update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class TeamMemberResponseDto {
  @ApiProperty({
    description: 'Team member unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Team member email address',
    example: 'member@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Team member full name',
    example: 'Jane Smith',
  })
  name: string;

  @ApiProperty({
    description: 'Team member avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'Team member role',
    enum: UserRole,
    example: UserRole.MEMBER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Team member subscription plan',
    enum: UserPlan,
    example: UserPlan.PRO,
  })
  plan: UserPlan;

  @ApiProperty({
    description: 'Whether email is verified',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Date when member joined the team',
    example: '2024-01-01T00:00:00.000Z',
  })
  joinedAt: Date;

  @ApiProperty({
    description: 'Last activity date',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastActiveAt: Date;
}

export class PaginationDto {
  @ApiProperty({
    description: 'Page number (starts from 1)',
    example: 1,
    minimum: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: 'Pagination information',
    example: {
      page: 1,
      limit: 10,
      total: 25,
      pages: 3
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Operation status',
    example: true,
  })
  success: boolean;
} 