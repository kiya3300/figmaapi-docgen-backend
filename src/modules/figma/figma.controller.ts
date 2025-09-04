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
import { FigmaService } from '../figma/figma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ConnectFigmaDto,
  FigmaFileResponseDto,
  FigmaFileListResponseDto,
  FigmaComponentResponseDto,
  FigmaComponentListResponseDto,
  AnalyzeFigmaFileDto,
  FigmaConnectionResponseDto,
  PaginationDto,
  MessageResponseDto
} from '../../shared/dto/figma.dto';

@ApiTags('Figma Integration')
@Controller('figma')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class FigmaController {
  constructor(private readonly figmaService: FigmaService) {}

  @Post('connect')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Connect Figma account',
    description: 'Connect user\'s Figma account using access token'
  })
  @ApiBody({ type: ConnectFigmaDto })
  @ApiCreatedResponse({ 
    description: 'Figma account connected successfully',
    type: FigmaConnectionResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - invalid token or validation failed',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid Figma access token' },
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
  async connectFigmaAccount(
    @Request() req,
    @Body() connectFigmaDto: ConnectFigmaDto
  ): Promise<FigmaConnectionResponseDto> {
    return this.figmaService.connectAccount(req.user.id, connectFigmaDto);
  }

  @Get('connection')
  @ApiOperation({ 
    summary: 'Get Figma connection status',
    description: 'Retrieve the current user\'s Figma connection status'
  })
  @ApiOkResponse({ 
    description: 'Figma connection status retrieved successfully',
    type: FigmaConnectionResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Figma connection not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Figma connection not found' },
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
  async getFigmaConnection(@Request() req): Promise<FigmaConnectionResponseDto> {
    return this.figmaService.getConnection(req.user.id);
  }

  @Delete('connection')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Disconnect Figma account',
    description: 'Disconnect user\'s Figma account'
  })
  @ApiOkResponse({ 
    description: 'Figma account disconnected successfully',
    type: MessageResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Figma connection not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Figma connection not found' },
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
  async disconnectFigmaAccount(@Request() req): Promise<MessageResponseDto> {
    return this.figmaService.disconnectAccount(req.user.id);
  }

  @Get('files')
  @ApiOperation({ 
    summary: 'List Figma files',
    description: 'Retrieve all Figma files accessible to the user'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'design system' })
  @ApiQuery({ name: 'type', required: false, enum: ['all', 'owned', 'shared'], example: 'all' })
  @ApiOkResponse({ 
    description: 'Figma files retrieved successfully',
    type: FigmaFileListResponseDto
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
    description: 'Forbidden - Figma account not connected',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Figma account not connected' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async getFigmaFiles(
    @Request() req,
    @Query() paginationDto: PaginationDto,
    @Query('search') search?: string,
    @Query('type') type?: string
  ): Promise<FigmaFileListResponseDto> {
    return this.figmaService.getFiles(req.user.id, paginationDto, search, type);
  }

  @Get('files/:id')
  @ApiOperation({ 
    summary: 'Get Figma file details',
    description: 'Retrieve detailed information about a specific Figma file'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Figma file ID',
    example: 'FigmaFileKey123'
  })
  @ApiOkResponse({ 
    description: 'Figma file details retrieved successfully',
    type: FigmaFileResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Figma file not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Figma file not found' },
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
    description: 'Forbidden - Figma account not connected or no access',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'No access to this Figma file' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async getFigmaFile(
    @Request() req,
    @Param('id') fileId: string
  ): Promise<FigmaFileResponseDto> {
    return this.figmaService.getFile(req.user.id, fileId);
  }

  @Post('analyze')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Analyze Figma file',
    description: 'Analyze a Figma file to extract components and generate API documentation'
  })
  @ApiBody({ type: AnalyzeFigmaFileDto })
  @ApiCreatedResponse({ 
    description: 'Figma file analysis started successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Analysis started successfully' },
        analysisId: { type: 'string', example: 'analysis-123' },
        status: { type: 'string', example: 'processing' },
        success: { type: 'boolean', example: true }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - invalid file ID or validation failed',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid Figma file ID' },
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
    description: 'Forbidden - Figma account not connected or no access',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'No access to this Figma file' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async analyzeFigmaFile(
    @Request() req,
    @Body() analyzeFigmaFileDto: AnalyzeFigmaFileDto
  ) {
    return this.figmaService.analyzeFile(req.user.id, analyzeFigmaFileDto);
  }

  @Get('components')
  @ApiOperation({ 
    summary: 'Get Figma components',
    description: 'Retrieve components from Figma files'
  })
  @ApiQuery({ name: 'fileId', required: false, type: String, example: 'FigmaFileKey123' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'button' })
  @ApiQuery({ name: 'type', required: false, enum: ['all', 'components', 'instances'], example: 'all' })
  @ApiOkResponse({ 
    description: 'Figma components retrieved successfully',
    type: FigmaComponentListResponseDto
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
    description: 'Forbidden - Figma account not connected',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Figma account not connected' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async getFigmaComponents(
    @Request() req,
    @Query() paginationDto: PaginationDto,
    @Query('fileId') fileId?: string,
    @Query('search') search?: string,
    @Query('type') type?: string
  ): Promise<FigmaComponentListResponseDto> {
    return this.figmaService.getComponents(req.user.id, paginationDto, fileId, search, type);
  }

  @Get('components/:id')
  @ApiOperation({ 
    summary: 'Get Figma component details',
    description: 'Retrieve detailed information about a specific Figma component'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Figma component ID',
    example: 'ComponentKey123'
  })
  @ApiOkResponse({ 
    description: 'Figma component details retrieved successfully',
    type: FigmaComponentResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Figma component not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Figma component not found' },
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
    description: 'Forbidden - Figma account not connected or no access',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'No access to this Figma component' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async getFigmaComponent(
    @Request() req,
    @Param('id') componentId: string
  ): Promise<FigmaComponentResponseDto> {
    return this.figmaService.getComponent(req.user.id, componentId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Figma webhook handler',
    description: 'Handle Figma webhook events for file updates'
  })
  @ApiBody({
    description: 'Figma webhook payload',
    schema: {
      type: 'object',
      properties: {
        event_type: { type: 'string', example: 'FILE_UPDATE' },
        file_key: { type: 'string', example: 'FigmaFileKey123' },
        file_name: { type: 'string', example: 'Design System' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
      }
    }
  })
  @ApiOkResponse({ 
    description: 'Webhook processed successfully',
    type: MessageResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - invalid webhook payload',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid webhook payload' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  async handleFigmaWebhook(@Body() webhookPayload: any): Promise<MessageResponseDto> {
    return this.figmaService.handleWebhook(webhookPayload);
  }

  @Get('analysis/:id/status')
  @ApiOperation({ 
    summary: 'Get analysis status',
    description: 'Check the status of a Figma file analysis'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Analysis ID',
    example: 'analysis-123'
  })
  @ApiOkResponse({ 
    description: 'Analysis status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        analysisId: { type: 'string', example: 'analysis-123' },
        status: { type: 'string', example: 'completed' },
        progress: { type: 'number', example: 100 },
        result: { type: 'object' },
        createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        completedAt: { type: 'string', example: '2024-01-01T00:05:00.000Z' }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Analysis not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Analysis not found' },
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
  async getAnalysisStatus(
    @Request() req,
    @Param('id') analysisId: string
  ) {
    return this.figmaService.getAnalysisStatus(req.user.id, analysisId);
  }

  @Get('connections')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List Figma connections' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Figma connections retrieved successfully' })
  async getConnections(@Request() req) {
    return this.figmaService.getConnections(req.user.id);
  }

  @Get('connections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Figma connection' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Connection ID' })
  @ApiOkResponse({ description: 'Figma connection retrieved successfully' })
  async getConnection(
    @Param('id') connectionId: string,
    @Request() req
  ) {
    return this.figmaService.getConnectionById(connectionId, req.user.id);
  }

  @Delete('connections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Disconnect Figma account' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Connection ID' })
  @ApiOkResponse({ description: 'Figma account disconnected successfully' })
  async disconnectAccount(
    @Param('id') connectionId: string,
    @Request() req
  ) {
    return this.figmaService.disconnectAccountById(connectionId, req.user.id);
  }
} 