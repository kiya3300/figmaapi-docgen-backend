import { 
  Controller, 
  Get, 
  Post, 
  Put, 
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
import { AdminService } from '../admin/admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import {
  BanUserDto,
  UnbanUserDto,
  UpdateUserPlanDto,
  SystemMetricsResponseDto,
  UserAnalyticsResponseDto,
  UsageAnalyticsResponseDto,
  BillingAnalyticsResponseDto,
  AdminUserResponseDto,
  AdminUserListResponseDto,
  PaginationDto,
  MessageResponseDto
} from '../../shared/dto/admin.dto';

@ApiTags('Admin Dashboard')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ 
    summary: 'List all users',
    description: 'Retrieve all users with admin-level details'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'banned', 'inactive'], example: 'active' })
  @ApiQuery({ name: 'plan', required: false, enum: ['free', 'pro', 'enterprise'], example: 'free' })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'john' })
  @ApiOkResponse({ 
    description: 'Users retrieved successfully',
    type: AdminUserListResponseDto
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
  @ApiForbiddenResponse({ 
    description: 'Forbidden - insufficient admin permissions',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Insufficient admin permissions' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async getUsers(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: string,
    @Query('plan') plan?: string,
    @Query('search') search?: string
  ): Promise<AdminUserListResponseDto> {
    return this.adminService.getUsers(paginationDto, status, plan, search);
  }

  @Get('users/:id')
  @ApiOperation({ 
    summary: 'Get user details',
    description: 'Retrieve detailed information about a specific user'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiOkResponse({ 
    description: 'User details retrieved successfully',
    type: AdminUserResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User not found' },
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
  @ApiForbiddenResponse({ 
    description: 'Forbidden - insufficient admin permissions',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Insufficient admin permissions' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async getUser(@Param('id') userId: string): Promise<AdminUserResponseDto> {
    return this.adminService.getUser(userId);
  }

  @Post('users/:id/ban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Ban user',
    description: 'Ban a user from the platform'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID to ban',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ type: BanUserDto })
  @ApiOkResponse({ 
    description: 'User banned successfully',
    type: MessageResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User not found' },
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
  @ApiForbiddenResponse({ 
    description: 'Forbidden - insufficient admin permissions',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Insufficient admin permissions' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async banUser(
    @Param('id') userId: string,
    @Body() banUserDto: BanUserDto
  ): Promise<MessageResponseDto> {
    return this.adminService.banUser(userId, banUserDto);
  }

  @Post('users/:id/unban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Unban user',
    description: 'Unban a user from the platform'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID to unban',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ type: UnbanUserDto })
  @ApiOkResponse({ 
    description: 'User unbanned successfully',
    type: MessageResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User not found' },
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
  @ApiForbiddenResponse({ 
    description: 'Forbidden - insufficient admin permissions',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Insufficient admin permissions' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async unbanUser(
    @Param('id') userId: string,
    @Body() unbanUserDto: UnbanUserDto
  ): Promise<MessageResponseDto> {
    return this.adminService.unbanUser(userId, unbanUserDto);
  }

  @Put('users/:id/plan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update user plan',
    description: 'Update user subscription plan'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ type: UpdateUserPlanDto })
  @ApiOkResponse({ 
    description: 'User plan updated successfully',
    type: MessageResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User not found' },
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
  @ApiForbiddenResponse({ 
    description: 'Forbidden - insufficient admin permissions',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Insufficient admin permissions' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async updateUserPlan(
    @Param('id') userId: string,
    @Body() updateUserPlanDto: UpdateUserPlanDto
  ): Promise<MessageResponseDto> {
    return this.adminService.updateUserPlan(userId, updateUserPlanDto);
  }

  @Get('metrics')
  @ApiOperation({ 
    summary: 'Get system metrics',
    description: 'Retrieve comprehensive system health and performance metrics'
  })
  @ApiOkResponse({ 
    description: 'System metrics retrieved successfully',
    type: SystemMetricsResponseDto
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
  @ApiForbiddenResponse({ 
    description: 'Forbidden - insufficient admin permissions',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Insufficient admin permissions' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async getSystemMetrics(): Promise<SystemMetricsResponseDto> {
    return this.adminService.getSystemMetrics();
  }

  @Get('analytics/users')
  @ApiOperation({ 
    summary: 'Get user analytics',
    description: 'Retrieve detailed user analytics and metrics'
  })
  @ApiQuery({ name: 'period', required: false, enum: ['1d', '7d', '30d', '90d'], example: '30d' })
  @ApiOkResponse({ 
    description: 'User analytics retrieved successfully',
    type: UserAnalyticsResponseDto
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
  @ApiForbiddenResponse({ 
    description: 'Forbidden - insufficient admin permissions',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Insufficient admin permissions' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async getUserAnalytics(@Query('period') period?: string): Promise<UserAnalyticsResponseDto> {
    return this.adminService.getUserAnalytics(period);
  }

  @Get('analytics')
  @ApiOperation({ 
    summary: 'Get usage analytics',
    description: 'Retrieve comprehensive usage analytics and metrics'
  })
  @ApiQuery({ name: 'period', required: false, enum: ['1d', '7d', '30d', '90d'], example: '30d' })
  @ApiQuery({ name: 'type', required: false, enum: ['all', 'projects', 'docs', 'figma'], example: 'all' })
  @ApiOkResponse({ 
    description: 'Usage analytics retrieved successfully',
    type: UsageAnalyticsResponseDto
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
  @ApiForbiddenResponse({ 
    description: 'Forbidden - insufficient admin permissions',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Insufficient admin permissions' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async getAnalytics(
    @Query('period') period?: string,
    @Query('type') type?: string
  ): Promise<UsageAnalyticsResponseDto> {
    return this.adminService.getUsageAnalytics(period, type);
  }

  @Get('analytics/projects')
  @ApiOperation({ 
    summary: 'Get project analytics',
    description: 'Retrieve project-specific analytics and metrics'
  })
  @ApiQuery({ name: 'period', required: false, enum: ['1d', '7d', '30d', '90d'], example: '30d' })
  @ApiOkResponse({ 
    description: 'Project analytics retrieved successfully',
    type: UsageAnalyticsResponseDto
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
  @ApiForbiddenResponse({ 
    description: 'Forbidden - insufficient admin permissions',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Insufficient admin permissions' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async getProjectAnalytics(@Query('period') period?: string): Promise<UsageAnalyticsResponseDto> {
    return this.adminService.getUsageAnalytics(period, 'projects');
  }

  @Get('analytics/documentation')
  @ApiOperation({ 
    summary: 'Get documentation analytics',
    description: 'Retrieve documentation-specific analytics and metrics'
  })
  @ApiQuery({ name: 'period', required: false, enum: ['1d', '7d', '30d', '90d'], example: '30d' })
  @ApiOkResponse({ 
    description: 'Documentation analytics retrieved successfully',
    type: UsageAnalyticsResponseDto
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
  @ApiForbiddenResponse({ 
    description: 'Forbidden - insufficient admin permissions',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Insufficient admin permissions' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async getDocumentationAnalytics(@Query('period') period?: string): Promise<UsageAnalyticsResponseDto> {
    return this.adminService.getUsageAnalytics(period, 'docs');
  }

  @Get('analytics/billing')
  @ApiOperation({ 
    summary: 'Get billing analytics',
    description: 'Retrieve billing and subscription analytics'
  })
  @ApiQuery({ name: 'period', required: false, enum: ['1m', '3m', '6m', '12m'], example: '3m' })
  @ApiOkResponse({ 
    description: 'Billing analytics retrieved successfully',
    type: BillingAnalyticsResponseDto
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
  @ApiForbiddenResponse({ 
    description: 'Forbidden - insufficient admin permissions',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Insufficient admin permissions' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async getBillingAnalytics(@Query('period') period?: string): Promise<BillingAnalyticsResponseDto> {
    return this.adminService.getBillingAnalytics(period);
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Get system health',
    description: 'Retrieve comprehensive system health status'
  })
  @ApiOkResponse({ 
    description: 'System health status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        uptime: { type: 'number', example: 86400 },
        memoryUsage: { type: 'number', example: 1024000 },
        cpuUsage: { type: 'number', example: 25.5 },
        diskUsage: { type: 'number', example: 45.2 },
        databaseStatus: { type: 'string', example: 'connected' },
        redisStatus: { type: 'string', example: 'connected' },
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
  @ApiForbiddenResponse({ 
    description: 'Forbidden - insufficient admin permissions',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Insufficient admin permissions' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }
} 