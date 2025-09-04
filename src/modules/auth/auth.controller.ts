import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Body, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  Param
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  UpdateProfileDto,
  AuthResponseDto,
  MessageResponseDto,
  RefreshTokenDto,
} from '../../shared/dto/auth.dto';
import { DocumentationResponseDto } from '../../shared/dto/documentation.dto';

@ApiTags('Authentication')
@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User registration',
    description: 'Register a new user account with email, password, and name'
  })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ 
    description: 'User registered successfully',
    type: AuthResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - validation failed or user already exists',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User with this email already exists' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with email and password'
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ 
    description: 'Login successful',
    type: AuthResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid credentials' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async login(@Body() loginDto: LoginDto, @Request() req): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User logout',
    description: 'Logout user and invalidate session'
  })
  @ApiBearerAuth()
  @ApiOkResponse({ 
    description: 'Logout successful',
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
  async logout(@Request() req): Promise<MessageResponseDto> {
    return this.authService.logout(req.user.id);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Forgot password',
    description: 'Send password reset link to user email'
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({ 
    description: 'Password reset email sent (if user exists)',
    type: MessageResponseDto
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
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<MessageResponseDto> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reset password',
    description: 'Reset user password using reset token'
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ 
    description: 'Password reset successful',
    type: MessageResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - validation failed, token expired, or passwords do not match',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Reset token has expired' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
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
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<MessageResponseDto> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Change password',
    description: 'Change user password (requires current password)'
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiBearerAuth()
  @ApiOkResponse({ 
    description: 'Password changed successfully',
    type: MessageResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - validation failed, current password incorrect, or passwords do not match',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Current password is incorrect' },
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
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<MessageResponseDto> {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Get new access token using refresh token'
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ 
    description: 'Token refreshed successfully',
    type: AuthResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - invalid or expired refresh token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Refresh token has expired' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Get current user profile information'
  })
  @ApiBearerAuth()
  @ApiOkResponse({ 
    description: 'Profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '1' },
        email: { type: 'string', example: 'user@example.com' },
        name: { type: 'string', example: 'John Doe' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
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
  async getProfile(@Request() req) {
    return this.authService.validateUser(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update profile',
    description: 'Update user profile information'
  })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({ 
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '1' },
        email: { type: 'string', example: 'user@example.com' },
        name: { type: 'string', example: 'John Doe' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
      }
    }
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
  ) {
    // In a real application, you would update the user profile here
    const user = await this.authService.validateUser(req.user.id);
    
    // Mock update (replace with actual database update)
    return {
      ...user,
      ...updateProfileDto,
      updatedAt: new Date(),
    };
  }
} 