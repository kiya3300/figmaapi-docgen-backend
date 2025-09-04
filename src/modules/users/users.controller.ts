import { 
  Controller, 
  Get, 
  Put, 
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
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  UpdateProfileDto,
  InviteTeamMemberDto,
  TeamMemberResponseDto,
  UserProfileResponseDto,
  MessageResponseDto,
  PaginationDto
} from '../../shared/dto/users.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Retrieve the current user profile information'
  })
  @ApiOkResponse({ 
    description: 'Profile retrieved successfully',
    type: UserProfileResponseDto
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
  async getProfile(@Request() req): Promise<UserProfileResponseDto> {
    return this.usersService.findById(req.user.id);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update user profile',
    description: 'Update the current user profile information'
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({ 
    description: 'Profile updated successfully',
    type: UserProfileResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - validation failed',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Please provide a valid email address' },
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
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get('team')
  @ApiOperation({ 
    summary: 'Get team members',
    description: 'Retrieve all team members for the current user'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({ 
    description: 'Team members retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/TeamMemberResponseDto' }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 25 },
            pages: { type: 'number', example: 3 }
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
  async getTeamMembers(
    @Request() req,
    @Query() paginationDto: PaginationDto
  ) {
    return this.usersService.getTeamMembers(req.user.id, paginationDto);
  }

  @Post('team')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Invite team member',
    description: 'Invite a new member to the team'
  })
  @ApiBody({ type: InviteTeamMemberDto })
  @ApiCreatedResponse({ 
    description: 'Team member invited successfully',
    type: MessageResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - validation failed or user already in team',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User is already a team member' },
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
  @ApiForbiddenResponse({ 
    description: 'Forbidden - insufficient permissions',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Insufficient permissions' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async inviteTeamMember(
    @Request() req,
    @Body() inviteTeamMemberDto: InviteTeamMemberDto
  ): Promise<MessageResponseDto> {
    return this.usersService.inviteTeamMember(req.user.id, inviteTeamMemberDto);
  }

  @Delete('team/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Remove team member',
    description: 'Remove a member from the team'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Team member ID to remove',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiOkResponse({ 
    description: 'Team member removed successfully',
    type: MessageResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - validation failed',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid team member ID' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Team member not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Team member not found' },
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
    description: 'Forbidden - insufficient permissions',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Insufficient permissions' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async removeTeamMember(
    @Request() req,
    @Param('id') teamMemberId: string
  ): Promise<MessageResponseDto> {
    return this.usersService.removeTeamMember(req.user.id, teamMemberId);
  }

  @Get('team/:id')
  @ApiOperation({ 
    summary: 'Get team member details',
    description: 'Retrieve detailed information about a specific team member'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Team member ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiOkResponse({ 
    description: 'Team member details retrieved successfully',
    type: TeamMemberResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Team member not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Team member not found' },
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
  async getTeamMember(
    @Request() req,
    @Param('id') teamMemberId: string
  ): Promise<TeamMemberResponseDto> {
    return this.usersService.getTeamMember(req.user.id, teamMemberId);
  }
} 