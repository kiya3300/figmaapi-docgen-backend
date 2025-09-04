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
  IsArray,
  IsBoolean,
  IsDateString
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum CacheType {
  USER = 'user',
  PROJECT = 'project',
  FIGMA = 'figma',
  DOCUMENTATION = 'documentation',
  ANALYTICS = 'analytics',
  SYSTEM = 'system'
}

export enum CacheStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  EVICTED = 'evicted'
}

export enum AnalyticsPeriod {
  ONE_HOUR = '1h',
  TWENTY_FOUR_HOURS = '24h',
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export class RefreshCacheDto {
  @ApiProperty({
    description: 'Cache type to refresh',
    enum: CacheType,
    example: CacheType.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(CacheType, { message: 'Invalid cache type' })
  cacheType?: CacheType;

  @ApiProperty({
    description: 'Specific cache keys to refresh',
    example: ['user:123', 'user:456'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Cache keys must be an array' })
  @IsString({ each: true, message: 'Each cache key must be a string' })
  keys?: string[];

  @ApiProperty({
    description: 'Whether to refresh all cache entries',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Refresh all must be a boolean' })
  refreshAll?: boolean = false;
}

export class CacheConfigDto {
  @ApiProperty({
    description: 'Default TTL (Time To Live) in seconds',
    example: 3600,
    minimum: 60,
    maximum: 86400,
  })
  @IsNumber({}, { message: 'TTL must be a number' })
  @Min(60, { message: 'TTL must be at least 60 seconds' })
  @Max(86400, { message: 'TTL must not exceed 86400 seconds (24 hours)' })
  defaultTtl: number;

  @ApiProperty({
    description: 'Maximum cache size in bytes',
    example: 104857600,
    minimum: 1048576,
    maximum: 1073741824,
  })
  @IsNumber({}, { message: 'Max size must be a number' })
  @Min(1048576, { message: 'Max size must be at least 1MB' })
  @Max(1073741824, { message: 'Max size must not exceed 1GB' })
  maxSize: number;

  @ApiProperty({
    description: 'Cache eviction policy',
    example: 'lru',
    enum: ['lru', 'lfu', 'fifo'],
  })
  @IsString({ message: 'Eviction policy must be a string' })
  evictionPolicy: string;

  @ApiProperty({
    description: 'Whether to enable cache compression',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Compression must be a boolean' })
  compression?: boolean = true;

  @ApiProperty({
    description: 'Cache type specific configurations',
    example: {
      user: { ttl: 1800, maxSize: 52428800 },
      project: { ttl: 7200, maxSize: 104857600 }
    },
    required: false,
  })
  @IsOptional()
  typeConfigs?: Record<string, any>;
}

export class CacheStatsResponseDto {
  @ApiProperty({
    description: 'Total number of cache entries',
    example: 1250,
  })
  totalEntries: number;

  @ApiProperty({
    description: 'Total cache size in bytes',
    example: 52428800,
  })
  totalSize: number;

  @ApiProperty({
    description: 'Cache hit rate (0-1)',
    example: 0.85,
  })
  hitRate: number;

  @ApiProperty({
    description: 'Cache miss rate (0-1)',
    example: 0.15,
  })
  missRate: number;

  @ApiProperty({
    description: 'Average response time in milliseconds',
    example: 5.2,
  })
  avgResponseTime: number;

  @ApiProperty({
    description: 'Cache entries by type',
    example: {
      user: 500,
      project: 300,
      figma: 200,
      documentation: 150,
      analytics: 100
    },
  })
  entriesByType: Record<string, number>;

  @ApiProperty({
    description: 'Cache size by type in bytes',
    example: {
      user: 20971520,
      project: 15728640,
      figma: 10485760,
      documentation: 4194304,
      analytics: 1048576
    },
  })
  sizeByType: Record<string, number>;

  @ApiProperty({
    description: 'Cache status distribution',
    example: {
      active: 1200,
      expired: 30,
      evicted: 20
    },
  })
  statusDistribution: Record<string, number>;

  @ApiProperty({
    description: 'Last cache statistics update',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastUpdated: Date;
}

export class CacheEntryResponseDto {
  @ApiProperty({
    description: 'Cache entry unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Cache entry key',
    example: 'user:123',
  })
  key: string;

  @ApiProperty({
    description: 'Cache type',
    enum: CacheType,
    example: CacheType.USER,
  })
  type: CacheType;

  @ApiProperty({
    description: 'Cache entry data (truncated)',
    example: '{"id": 123, "name": "John Doe", ...}',
  })
  data: string;

  @ApiProperty({
    description: 'Cache entry size in bytes',
    example: 1024,
  })
  size: number;

  @ApiProperty({
    description: 'Number of times this entry was accessed',
    example: 25,
  })
  hitCount: number;

  @ApiProperty({
    description: 'Cache entry status',
    enum: CacheStatus,
    example: CacheStatus.ACTIVE,
  })
  status: CacheStatus;

  @ApiProperty({
    description: 'Last accessed timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastAccessed: Date;

  @ApiProperty({
    description: 'Entry expiration timestamp',
    example: '2024-01-01T01:00:00.000Z',
    required: false,
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Entry creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

export class CacheEntryListResponseDto {
  @ApiProperty({
    description: 'Array of cache entries',
    type: [CacheEntryResponseDto],
  })
  data: CacheEntryResponseDto[];

  @ApiProperty({
    description: 'Pagination information',
    example: {
      page: 1,
      limit: 10,
      total: 1250,
      pages: 125
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class CacheAnalyticsResponseDto {
  @ApiProperty({
    description: 'Analytics period',
    enum: AnalyticsPeriod,
    example: AnalyticsPeriod.TWENTY_FOUR_HOURS,
  })
  period: AnalyticsPeriod;

  @ApiProperty({
    description: 'Cache type filter',
    enum: CacheType,
    example: CacheType.USER,
    required: false,
  })
  cacheType?: CacheType;

  @ApiProperty({
    description: 'Overall hit rate for the period',
    example: 0.87,
  })
  hitRate: number;

  @ApiProperty({
    description: 'Overall miss rate for the period',
    example: 0.13,
  })
  missRate: number;

  @ApiProperty({
    description: 'Average response time for the period',
    example: 4.8,
  })
  avgResponseTime: number;

  @ApiProperty({
    description: 'Total requests for the period',
    example: 50000,
  })
  totalRequests: number;

  @ApiProperty({
    description: 'Total hits for the period',
    example: 43500,
  })
  totalHits: number;

  @ApiProperty({
    description: 'Total misses for the period',
    example: 6500,
  })
  totalMisses: number;

  @ApiProperty({
    description: 'Peak memory usage during the period',
    example: 67108864,
  })
  peakMemoryUsage: number;

  @ApiProperty({
    description: 'Average memory usage during the period',
    example: 52428800,
  })
  avgMemoryUsage: number;

  @ApiProperty({
    description: 'Hourly analytics data',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        hour: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        hits: { type: 'number', example: 1800 },
        misses: { type: 'number', example: 200 },
        hitRate: { type: 'number', example: 0.90 },
        avgResponseTime: { type: 'number', example: 4.5 }
      }
    }
  })
  hourlyData: Array<{
    hour: string;
    hits: number;
    misses: number;
    hitRate: number;
    avgResponseTime: number;
  }>;

  @ApiProperty({
    description: 'Cache type breakdown',
    example: {
      user: { hits: 20000, misses: 2000, hitRate: 0.91 },
      project: { hits: 15000, misses: 2500, hitRate: 0.86 },
      figma: { hits: 8500, misses: 2000, hitRate: 0.81 }
    },
  })
  typeBreakdown: Record<string, {
    hits: number;
    misses: number;
    hitRate: number;
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