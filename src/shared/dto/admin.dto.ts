import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  MinLength, 
  MaxLength, 
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsDateString
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum UserStatus {
  ACTIVE = 'active',
  BANNED = 'banned',
  INACTIVE = 'inactive'
}

export enum UserPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum AnalyticsPeriod {
  ONE_DAY = '1d',
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  NINETY_DAYS = '90d'
}

export enum BillingPeriod {
  ONE_MONTH = '1m',
  THREE_MONTHS = '3m',
  SIX_MONTHS = '6m',
  TWELVE_MONTHS = '12m'
}

export enum UsageType {
  ALL = 'all',
  PROJECTS = 'projects',
  DOCS = 'docs',
  FIGMA = 'figma'
}

export class BanUserDto {
  @ApiProperty({
    description: 'Reason for banning the user',
    example: 'Violation of terms of service',
    minLength: 10,
    maxLength: 500,
  })
  @IsString({ message: 'Reason must be a string' })
  @MinLength(10, { message: 'Reason must be at least 10 characters long' })
  @MaxLength(500, { message: 'Reason must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  reason: string;

  @ApiProperty({
    description: 'Duration of ban in days (0 for permanent)',
    example: 30,
    minimum: 0,
    maximum: 365,
  })
  @IsNumber({}, { message: 'Duration must be a number' })
  @Min(0, { message: 'Duration must be at least 0 days' })
  @Max(365, { message: 'Duration must not exceed 365 days' })
  duration: number;

  @ApiProperty({
    description: 'Additional notes for the ban',
    example: 'User was warned multiple times before this action',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  notes?: string;
}

export class UnbanUserDto {
  @ApiProperty({
    description: 'Reason for unbanning the user',
    example: 'User has appealed and provided explanation',
    minLength: 10,
    maxLength: 500,
  })
  @IsString({ message: 'Reason must be a string' })
  @MinLength(10, { message: 'Reason must be at least 10 characters long' })
  @MaxLength(500, { message: 'Reason must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  reason: string;

  @ApiProperty({
    description: 'Additional notes for the unban',
    example: 'User has agreed to follow terms of service',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  notes?: string;
}

export class UpdateUserPlanDto {
  @ApiProperty({
    description: 'New plan for the user',
    enum: UserPlan,
    example: UserPlan.PRO,
  })
  @IsEnum(UserPlan, { message: 'Invalid plan specified' })
  plan: UserPlan;

  @ApiProperty({
    description: 'Reason for plan change',
    example: 'User requested upgrade to pro plan',
    minLength: 10,
    maxLength: 500,
  })
  @IsString({ message: 'Reason must be a string' })
  @MinLength(10, { message: 'Reason must be at least 10 characters long' })
  @MaxLength(500, { message: 'Reason must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  reason: string;

  @ApiProperty({
    description: 'Whether to prorate the billing',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Prorate must be a boolean' })
  prorate?: boolean = true;
}

export class AdminUserResponseDto {
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
    description: 'User status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

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
    description: 'Number of projects owned',
    example: 5,
  })
  projectCount: number;

  @ApiProperty({
    description: 'Number of team members',
    example: 3,
  })
  teamMemberCount: number;

  @ApiProperty({
    description: 'Total storage used in bytes',
    example: 10485760,
  })
  storageUsed: number;

  @ApiProperty({
    description: 'Last login date',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Ban reason if user is banned',
    example: 'Violation of terms of service',
    required: false,
  })
  banReason?: string;

  @ApiProperty({
    description: 'Ban expiration date if user is banned',
    example: '2024-02-01T00:00:00.000Z',
    required: false,
  })
  banExpiresAt?: Date;

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

export class AdminUserListResponseDto {
  @ApiProperty({
    description: 'Array of users',
    type: [AdminUserResponseDto],
  })
  data: AdminUserResponseDto[];

  @ApiProperty({
    description: 'Pagination information',
    example: {
      page: 1,
      limit: 10,
      total: 250,
      pages: 25
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class SystemMetricsResponseDto {
  @ApiProperty({
    description: 'Total number of users',
    example: 1250,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Active users in the last 30 days',
    example: 850,
  })
  activeUsers: number;

  @ApiProperty({
    description: 'New users in the last 30 days',
    example: 150,
  })
  newUsers: number;

  @ApiProperty({
    description: 'Total number of projects',
    example: 3200,
  })
  totalProjects: number;

  @ApiProperty({
    description: 'Total number of documentation files',
    example: 8500,
  })
  totalDocumentation: number;

  @ApiProperty({
    description: 'Total storage used in bytes',
    example: 107374182400,
  })
  totalStorageUsed: number;

  @ApiProperty({
    description: 'System uptime in seconds',
    example: 86400,
  })
  uptime: number;

  @ApiProperty({
    description: 'Memory usage percentage',
    example: 65.5,
  })
  memoryUsage: number;

  @ApiProperty({
    description: 'CPU usage percentage',
    example: 25.3,
  })
  cpuUsage: number;

  @ApiProperty({
    description: 'Disk usage percentage',
    example: 45.8,
  })
  diskUsage: number;

  @ApiProperty({
    description: 'Average response time in milliseconds',
    example: 125.5,
  })
  avgResponseTime: number;

  @ApiProperty({
    description: 'Requests per second',
    example: 150.2,
  })
  requestsPerSecond: number;

  @ApiProperty({
    description: 'Error rate percentage',
    example: 0.5,
  })
  errorRate: number;

  @ApiProperty({
    description: 'Last metrics update',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastUpdated: Date;
}

export class UserAnalyticsResponseDto {
  @ApiProperty({
    description: 'Analytics period',
    enum: AnalyticsPeriod,
    example: AnalyticsPeriod.THIRTY_DAYS,
  })
  period: AnalyticsPeriod;

  @ApiProperty({
    description: 'Total users at the end of period',
    example: 1250,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'New users during the period',
    example: 150,
  })
  newUsers: number;

  @ApiProperty({
    description: 'Active users during the period',
    example: 850,
  })
  activeUsers: number;

  @ApiProperty({
    description: 'User growth rate percentage',
    example: 12.5,
  })
  growthRate: number;

  @ApiProperty({
    description: 'User retention rate percentage',
    example: 85.2,
  })
  retentionRate: number;

  @ApiProperty({
    description: 'User churn rate percentage',
    example: 14.8,
  })
  churnRate: number;

  @ApiProperty({
    description: 'Plan distribution',
    example: {
      free: 800,
      pro: 350,
      enterprise: 100
    },
  })
  planDistribution: Record<string, number>;

  @ApiProperty({
    description: 'Daily user registrations',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: { type: 'string', example: '2024-01-01' },
        registrations: { type: 'number', example: 5 },
        activeUsers: { type: 'number', example: 850 }
      }
    }
  })
  dailyData: Array<{
    date: string;
    registrations: number;
    activeUsers: number;
  }>;

  @ApiProperty({
    description: 'Top countries by user count',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        country: { type: 'string', example: 'United States' },
        users: { type: 'number', example: 450 },
        percentage: { type: 'number', example: 36.0 }
      }
    }
  })
  topCountries: Array<{
    country: string;
    users: number;
    percentage: number;
  }>;
}

export class UsageAnalyticsResponseDto {
  @ApiProperty({
    description: 'Analytics period',
    enum: AnalyticsPeriod,
    example: AnalyticsPeriod.THIRTY_DAYS,
  })
  period: AnalyticsPeriod;

  @ApiProperty({
    description: 'Usage type filter',
    enum: UsageType,
    example: UsageType.ALL,
  })
  type: UsageType;

  @ApiProperty({
    description: 'Total projects created',
    example: 3200,
  })
  totalProjects: number;

  @ApiProperty({
    description: 'Total documentation generated',
    example: 8500,
  })
  totalDocumentation: number;

  @ApiProperty({
    description: 'Total Figma files analyzed',
    example: 4200,
  })
  totalFigmaFiles: number;

  @ApiProperty({
    description: 'Total API requests',
    example: 150000,
  })
  totalApiRequests: number;

  @ApiProperty({
    description: 'Average projects per user',
    example: 2.56,
  })
  avgProjectsPerUser: number;

  @ApiProperty({
    description: 'Average documentation per project',
    example: 2.66,
  })
  avgDocumentationPerProject: number;

  @ApiProperty({
    description: 'Most used features',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        feature: { type: 'string', example: 'API Documentation Generation' },
        usage: { type: 'number', example: 4500 },
        percentage: { type: 'number', example: 52.9 }
      }
    }
  })
  mostUsedFeatures: Array<{
    feature: string;
    usage: number;
    percentage: number;
  }>;

  @ApiProperty({
    description: 'Daily usage trends',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: { type: 'string', example: '2024-01-01' },
        projects: { type: 'number', example: 15 },
        documentation: { type: 'number', example: 25 },
        figmaFiles: { type: 'number', example: 12 }
      }
    }
  })
  dailyTrends: Array<{
    date: string;
    projects: number;
    documentation: number;
    figmaFiles: number;
  }>;
}

export class BillingAnalyticsResponseDto {
  @ApiProperty({
    description: 'Billing period',
    enum: BillingPeriod,
    example: BillingPeriod.THREE_MONTHS,
  })
  period: BillingPeriod;

  @ApiProperty({
    description: 'Total revenue',
    example: 45000.00,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Monthly recurring revenue',
    example: 15000.00,
  })
  mrr: number;

  @ApiProperty({
    description: 'Annual recurring revenue',
    example: 180000.00,
  })
  arr: number;

  @ApiProperty({
    description: 'Revenue growth rate percentage',
    example: 25.5,
  })
  revenueGrowth: number;

  @ApiProperty({
    description: 'Average revenue per user',
    example: 36.00,
  })
  arpu: number;

  @ApiProperty({
    description: 'Customer lifetime value',
    example: 432.00,
  })
  clv: number;

  @ApiProperty({
    description: 'Plan distribution by revenue',
    example: {
      free: 0,
      pro: 30000.00,
      enterprise: 15000.00
    },
  })
  revenueByPlan: Record<string, number>;

  @ApiProperty({
    description: 'Monthly revenue trends',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        month: { type: 'string', example: '2024-01' },
        revenue: { type: 'number', example: 15000.00 },
        newSubscriptions: { type: 'number', example: 25 },
        cancellations: { type: 'number', example: 5 }
      }
    }
  })
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    newSubscriptions: number;
    cancellations: number;
  }>;

  @ApiProperty({
    description: 'Top paying customers',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john@example.com' },
        plan: { type: 'string', example: 'enterprise' },
        revenue: { type: 'number', example: 5000.00 }
      }
    }
  })
  topCustomers: Array<{
    userId: string;
    name: string;
    email: string;
    plan: string;
    revenue: number;
  }>;
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