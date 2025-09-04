import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  Query
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse
} from '@nestjs/swagger';
import { CacheService } from '../cache/cache.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CacheStatsResponseDto,
  CacheEntryResponseDto,
  CacheEntryListResponseDto,
  CacheConfigDto,
  CacheAnalyticsResponseDto,
  RefreshCacheDto,
  PaginationDto,
  MessageResponseDto
} from '../../shared/dto/cache.dto';

@ApiTags('Cache Management')
@Controller('cache')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get cache statistics',
    description: 'Retrieve comprehensive cache statistics and metrics'
  })
  @ApiOkResponse({ 
    description: 'Cache statistics retrieved successfully',
    type: CacheStatsResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async getCacheStats(): Promise<CacheStatsResponseDto> {
    return this.cacheService.getCacheStats();
  }

  @Get('entries')
  @ApiOperation({ 
    summary: 'List cache entries',
    description: 'Retrieve all cache entries with detailed information'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'cacheType', required: false, type: String, example: 'user' })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'user' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['created', 'accessed', 'size'], example: 'accessed' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], example: 'desc' })
  @ApiOkResponse({ 
    description: 'Cache entries retrieved successfully',
    type: CacheEntryListResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async getCacheEntries(
    @Query() paginationDto: PaginationDto,
    @Query('cacheType') cacheType?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string
  ): Promise<CacheEntryListResponseDto> {
    return this.cacheService.getCacheEntries(paginationDto, cacheType, search, sortBy, sortOrder);
  }

  @Get('entries/:key')
  @ApiOperation({ 
    summary: 'Get cache entry details',
    description: 'Retrieve detailed information about a specific cache entry'
  })
  @ApiParam({ 
    name: 'key', 
    description: 'Cache entry key',
    example: 'user:123'
  })
  @ApiOkResponse({ 
    description: 'Cache entry details retrieved successfully',
    type: CacheEntryResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Cache entry not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Cache entry not found' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async getCacheEntry(@Param('key') key: string): Promise<CacheEntryResponseDto> {
    return this.cacheService.getCacheEntry(key);
  }

  @Delete('entries/:key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete cache entry',
    description: 'Delete a specific cache entry'
  })
  @ApiParam({ 
    name: 'key', 
    description: 'Cache entry key to delete',
    example: 'user:123'
  })
  @ApiOkResponse({ 
    description: 'Cache entry deleted successfully',
    type: MessageResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Cache entry not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Cache entry not found' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async deleteCacheEntry(@Param('key') key: string): Promise<MessageResponseDto> {
    return this.cacheService.deleteCacheEntry(key);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Refresh cache entries',
    description: 'Refresh specific cache entries or all cache entries'
  })
  @ApiBody({ type: RefreshCacheDto })
  @ApiOkResponse({ 
    description: 'Cache entries refreshed successfully',
    type: MessageResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - invalid parameters',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid cache type' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async refreshCache(@Body() refreshCacheDto: RefreshCacheDto): Promise<MessageResponseDto> {
    return this.cacheService.refreshCache(refreshCacheDto);
  }

  @Delete('clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Clear all cache',
    description: 'Clear all cache entries from the system'
  })
  @ApiQuery({ name: 'cacheType', required: false, type: String, example: 'user' })
  @ApiOkResponse({ 
    description: 'Cache cleared successfully',
    type: MessageResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async clearCache(@Query('cacheType') cacheType?: string): Promise<MessageResponseDto> {
    return this.cacheService.clearCache(cacheType);
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Get cache health status',
    description: 'Retrieve cache health and performance metrics'
  })
  @ApiOkResponse({ 
    description: 'Cache health status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        uptime: { type: 'number', example: 86400 },
        memoryUsage: { type: 'number', example: 1024000 },
        hitRate: { type: 'number', example: 0.85 },
        avgResponseTime: { type: 'number', example: 5.2 },
        lastCheck: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async getCacheHealth() {
    return this.cacheService.getCacheHealth();
  }

  @Post('config')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update cache configuration',
    description: 'Update cache configuration settings'
  })
  @ApiBody({ type: CacheConfigDto })
  @ApiOkResponse({ 
    description: 'Cache configuration updated successfully',
    type: MessageResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - invalid configuration',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid TTL value' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async updateCacheConfig(@Body() cacheConfigDto: CacheConfigDto): Promise<MessageResponseDto> {
    return this.cacheService.updateCacheConfig(cacheConfigDto);
  }

  @Get('analytics')
  @ApiOperation({ 
    summary: 'Get cache analytics',
    description: 'Retrieve detailed cache performance analytics and trends'
  })
  @ApiQuery({ name: 'period', required: false, enum: ['1h', '24h', '7d', '30d'], example: '24h' })
  @ApiQuery({ name: 'cacheType', required: false, type: String, example: 'user' })
  @ApiOkResponse({ 
    description: 'Cache analytics retrieved successfully',
    type: CacheAnalyticsResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async getCacheAnalytics(
    @Query('period') period?: string,
    @Query('cacheType') cacheType?: string
  ): Promise<CacheAnalyticsResponseDto> {
    return this.cacheService.getCacheAnalytics(period, cacheType);
  }

  @Get('analytics/performance')
  @ApiOperation({ 
    summary: 'Get cache performance metrics',
    description: 'Retrieve detailed cache performance metrics and trends'
  })
  @ApiQuery({ name: 'period', required: false, enum: ['1h', '24h', '7d', '30d'], example: '24h' })
  @ApiOkResponse({ 
    description: 'Cache performance metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        hitRate: { type: 'number', example: 0.85 },
        missRate: { type: 'number', example: 0.15 },
        avgResponseTime: { type: 'number', example: 5.2 },
        throughput: { type: 'number', example: 1000 },
        memoryEfficiency: { type: 'number', example: 0.92 },
        trends: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
              hitRate: { type: 'number', example: 0.85 },
              responseTime: { type: 'number', example: 5.2 }
            }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async getCachePerformance(@Query('period') period?: string) {
    return this.cacheService.getCachePerformance(period);
  }

  @Get('analytics/size-distribution')
  @ApiOperation({ 
    summary: 'Get cache size distribution',
    description: 'Retrieve cache size distribution analytics'
  })
  @ApiOkResponse({ 
    description: 'Cache size distribution retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalSize: { type: 'number', example: 1024000 },
        averageSize: { type: 'number', example: 512 },
        sizeDistribution: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              range: { type: 'string', example: '0-1KB' },
              count: { type: 'number', example: 150 },
              percentage: { type: 'number', example: 75 }
            }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async getCacheSizeDistribution() {
    return this.cacheService.getCacheSizeDistribution();
  }
} 