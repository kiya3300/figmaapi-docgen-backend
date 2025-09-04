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
  Query,
  Res
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
import { Response } from 'express';
import { DocumentationService } from '../documentation/documentation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  GenerateDocumentationDto,
  UpdateDocumentationDto,
  DocumentationResponseDto,
  DocumentationListResponseDto,
  DocumentationVersionResponseDto,
  ExportDocumentationDto,
  PaginationDto,
  MessageResponseDto
} from '../../shared/dto/documentation.dto';

@ApiTags('Documentation')
@Controller('docs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class DocumentationController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Generate API documentation',
    description: 'Generate API documentation from Figma file analysis'
  })
  @ApiBody({ type: GenerateDocumentationDto })
  @ApiCreatedResponse({ 
    description: 'Documentation generation started successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Documentation generation started' },
        documentationId: { type: 'string', example: 'doc-123' },
        status: { type: 'string', example: 'processing' },
        success: { type: 'boolean', example: true }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - invalid parameters or validation failed',
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
  async generateDocumentation(
    @Request() req,
    @Body() generateDocumentationDto: GenerateDocumentationDto
  ) {
    return this.documentationService.generateDocumentation(req.user.id, generateDocumentationDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'List documentation',
    description: 'Retrieve all documentation for the current user'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'projectId', required: false, type: String, example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published', 'archived'], example: 'published' })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'API' })
  @ApiOkResponse({ 
    description: 'Documentation list retrieved successfully',
    type: DocumentationListResponseDto
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
  async getDocumentation(
    @Request() req,
    @Query() paginationDto: PaginationDto,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string
  ): Promise<DocumentationListResponseDto> {
    return this.documentationService.getDocumentation(req.user.id, paginationDto, projectId, status, search);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get documentation details',
    description: 'Retrieve detailed information about a specific documentation'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Documentation ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiOkResponse({ 
    description: 'Documentation details retrieved successfully',
    type: DocumentationResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Documentation not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Documentation not found' },
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
  async getDocumentationById(
    @Request() req,
    @Param('id') documentationId: string
  ): Promise<DocumentationResponseDto> {
    return this.documentationService.getDocumentationById(req.user.id, documentationId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update documentation',
    description: 'Update documentation information and content'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Documentation ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ type: UpdateDocumentationDto })
  @ApiOkResponse({ 
    description: 'Documentation updated successfully',
    type: DocumentationResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - validation failed',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Title is required' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Documentation not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Documentation not found' },
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
  async updateDocumentation(
    @Request() req,
    @Param('id') documentationId: string,
    @Body() updateDocumentationDto: UpdateDocumentationDto
  ): Promise<DocumentationResponseDto> {
    return this.documentationService.updateDocumentation(req.user.id, documentationId, updateDocumentationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete documentation',
    description: 'Delete documentation and all associated versions'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Documentation ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiOkResponse({ 
    description: 'Documentation deleted successfully',
    type: MessageResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Documentation not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Documentation not found' },
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
  async deleteDocumentation(
    @Request() req,
    @Param('id') documentationId: string
  ): Promise<MessageResponseDto> {
    return this.documentationService.deleteDocumentation(req.user.id, documentationId);
  }

  @Get(':id/export')
  @ApiOperation({ 
    summary: 'Export documentation',
    description: 'Export documentation in various formats (OpenAPI, JSON, Markdown)'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Documentation ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ name: 'format', required: true, enum: ['openapi', 'json', 'markdown', 'html'], example: 'openapi' })
  @ApiQuery({ name: 'version', required: false, type: Number, example: 1 })
  @ApiOkResponse({ 
    description: 'Documentation exported successfully',
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', example: '# API Documentation...' },
        format: { type: 'string', example: 'markdown' },
        filename: { type: 'string', example: 'api-docs-v1.md' },
        size: { type: 'number', example: 1024 }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Documentation not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Documentation not found' },
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
  async exportDocumentation(
    @Request() req,
    @Param('id') documentationId: string,
    @Query('format') format: string,
    @Query('version') version?: number,
    @Res() res?: Response
  ) {
    const result = await this.documentationService.exportDocumentation(
      req.user.id, 
      documentationId, 
      format, 
      version
    );

    if (res) {
      res.setHeader('Content-Type', this.getContentType(format));
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.content);
    }

    return result;
  }

  @Post(':id/version')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create new version',
    description: 'Create a new version of the documentation'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Documentation ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiCreatedResponse({ 
    description: 'New version created successfully',
    type: DocumentationVersionResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Documentation not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Documentation not found' },
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
  async createVersion(
    @Request() req,
    @Param('id') documentationId: string
  ): Promise<DocumentationVersionResponseDto> {
    return this.documentationService.createVersion(req.user.id, documentationId);
  }

  @Get(':id/versions')
  @ApiOperation({ 
    summary: 'Get documentation versions',
    description: 'Retrieve all versions of a documentation'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Documentation ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({ 
    description: 'Documentation versions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/DocumentationVersionResponseDto' }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 5 },
            pages: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Documentation not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Documentation not found' },
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
  async getVersions(
    @Request() req,
    @Param('id') documentationId: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.documentationService.getVersions(req.user.id, documentationId, paginationDto);
  }

  @Get(':id/versions/:versionId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get specific documentation version',
    description: 'Retrieve a specific version of documentation'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Documentation ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiParam({ 
    name: 'versionId', 
    description: 'Version ID',
    example: 'v1.0.0'
  })
  @ApiOkResponse({ 
    description: 'Documentation version retrieved successfully',
    type: DocumentationResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Documentation or version not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Documentation version not found' },
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
  async getDocumentationVersion(
    @Request() req,
    @Param('id') documentationId: string,
    @Param('versionId') versionId: string
  ): Promise<DocumentationResponseDto> {
    return this.documentationService.getDocumentationVersion(req.user.id, documentationId, versionId);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Publish documentation',
    description: 'Publish documentation to make it publicly accessible'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Documentation ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiOkResponse({ 
    description: 'Documentation published successfully',
    type: MessageResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Documentation not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Documentation not found' },
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
  async publishDocumentation(
    @Request() req,
    @Param('id') documentationId: string
  ): Promise<MessageResponseDto> {
    return this.documentationService.publishDocumentation(req.user.id, documentationId);
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Unpublish documentation',
    description: 'Unpublish documentation to make it private again'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Documentation ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiOkResponse({ 
    description: 'Documentation unpublished successfully',
    type: MessageResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Documentation not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Documentation not found' },
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
  async unpublishDocumentation(
    @Request() req,
    @Param('id') documentationId: string
  ): Promise<MessageResponseDto> {
    return this.documentationService.unpublishDocumentation(req.user.id, documentationId);
  }

  private getContentType(format: string): string {
    switch (format) {
      case 'openapi':
        return 'application/yaml';
      case 'json':
        return 'application/json';
      case 'markdown':
        return 'text/markdown';
      case 'html':
        return 'text/html';
      default:
        return 'application/octet-stream';
    }
  }
} 