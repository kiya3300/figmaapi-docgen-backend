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
  IsUUID
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum DocumentationStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum DocumentationFormat {
  OPENAPI = 'openapi',
  JSON = 'json',
  MARKDOWN = 'markdown',
  HTML = 'html'
}

export enum ExportFormat {
  OPENAPI = 'openapi',
  JSON = 'json',
  MARKDOWN = 'markdown',
  HTML = 'html'
}

export class GenerateDocumentationDto {
  @ApiProperty({
    description: 'Documentation title',
    example: 'E-commerce API Documentation',
    minLength: 3,
    maxLength: 200,
  })
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiProperty({
    description: 'Documentation description',
    example: 'Complete API documentation for our e-commerce platform',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Project ID to associate with the documentation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Invalid project ID format' })
  projectId: string;

  @ApiProperty({
    description: 'Figma file ID to analyze',
    example: 'FigmaFileKey123',
  })
  @IsString({ message: 'Figma file ID must be a string' })
  @MinLength(10, { message: 'Figma file ID must be at least 10 characters long' })
  @MaxLength(50, { message: 'Figma file ID must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  figmaFileId: string;

  @ApiProperty({
    description: 'Documentation format',
    enum: DocumentationFormat,
    example: DocumentationFormat.OPENAPI,
    required: false,
    default: DocumentationFormat.OPENAPI,
  })
  @IsOptional()
  @IsEnum(DocumentationFormat, { message: 'Invalid documentation format' })
  format?: DocumentationFormat = DocumentationFormat.OPENAPI;

  @ApiProperty({
    description: 'Documentation template',
    example: 'default',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Template must be a string' })
  @MaxLength(100, { message: 'Template must not exceed 100 characters' })
  template?: string;

  @ApiProperty({
    description: 'Documentation tags',
    example: ['api', 'e-commerce', 'v1'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @MaxLength(50, { each: true, message: 'Each tag must not exceed 50 characters' })
  tags?: string[];

  @ApiProperty({
    description: 'Analysis options',
    example: {
      includeComponents: true,
      includeStyles: true,
      includeFrames: false,
      generateApiDocs: true,
      includeExamples: true
    },
    required: false,
  })
  @IsOptional()
  analysisOptions?: {
    includeComponents?: boolean;
    includeStyles?: boolean;
    includeFrames?: boolean;
    generateApiDocs?: boolean;
    includeExamples?: boolean;
  };
}

export class UpdateDocumentationDto {
  @ApiProperty({
    description: 'Documentation title',
    example: 'Updated E-commerce API Documentation',
    minLength: 3,
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  title?: string;

  @ApiProperty({
    description: 'Documentation description',
    example: 'Updated API documentation for our e-commerce platform',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Documentation content',
    example: { openapi: '3.0.0', info: { title: 'API Documentation' } },
    required: false,
  })
  @IsOptional()
  content?: any;

  @ApiProperty({
    description: 'Documentation status',
    enum: DocumentationStatus,
    example: DocumentationStatus.PUBLISHED,
    required: false,
  })
  @IsOptional()
  @IsEnum(DocumentationStatus, { message: 'Invalid documentation status' })
  status?: DocumentationStatus;

  @ApiProperty({
    description: 'Documentation tags',
    example: ['api', 'e-commerce', 'v2'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @MaxLength(50, { each: true, message: 'Each tag must not exceed 50 characters' })
  tags?: string[];

  @ApiProperty({
    description: 'Whether documentation is public',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Public must be a boolean' })
  isPublic?: boolean;
}

export class DocumentationResponseDto {
  @ApiProperty({
    description: 'Documentation unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Documentation title',
    example: 'E-commerce API Documentation',
  })
  title: string;

  @ApiProperty({
    description: 'Documentation description',
    example: 'Complete API documentation for our e-commerce platform',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId: string;

  @ApiProperty({
    description: 'Project name',
    example: 'E-commerce API Documentation',
  })
  projectName: string;

  @ApiProperty({
    description: 'Figma file ID',
    example: 'FigmaFileKey123',
  })
  figmaFileId: string;

  @ApiProperty({
    description: 'Figma file name',
    example: 'E-commerce Design System',
  })
  figmaFileName: string;

  @ApiProperty({
    description: 'Documentation format',
    enum: DocumentationFormat,
    example: DocumentationFormat.OPENAPI,
  })
  format: DocumentationFormat;

  @ApiProperty({
    description: 'Documentation template',
    example: 'default',
  })
  template: string;

  @ApiProperty({
    description: 'Documentation content',
    example: { openapi: '3.0.0', info: { title: 'API Documentation' } },
  })
  content: any;

  @ApiProperty({
    description: 'Documentation status',
    enum: DocumentationStatus,
    example: DocumentationStatus.PUBLISHED,
  })
  status: DocumentationStatus;

  @ApiProperty({
    description: 'Documentation tags',
    example: ['api', 'e-commerce', 'v1'],
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'Whether documentation is public',
    example: true,
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'Current version number',
    example: 1,
  })
  currentVersion: number;

  @ApiProperty({
    description: 'Total number of versions',
    example: 3,
  })
  totalVersions: number;

  @ApiProperty({
    description: 'Documentation owner ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  ownerId: string;

  @ApiProperty({
    description: 'Documentation owner name',
    example: 'John Doe',
  })
  ownerName: string;

  @ApiProperty({
    description: 'Public URL for published documentation',
    example: 'https://docs.example.com/api-docs/123',
    required: false,
  })
  publicUrl?: string;

  @ApiProperty({
    description: 'Last activity date',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastActivityAt: Date;

  @ApiProperty({
    description: 'Documentation creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last documentation update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class DocumentationListResponseDto {
  @ApiProperty({
    description: 'Array of documentation',
    type: [DocumentationResponseDto],
  })
  data: DocumentationResponseDto[];

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

export class DocumentationVersionResponseDto {
  @ApiProperty({
    description: 'Version unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Documentation ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  documentationId: string;

  @ApiProperty({
    description: 'Version number',
    example: 2,
  })
  version: number;

  @ApiProperty({
    description: 'Version title',
    example: 'v2.0.0 - Major Update',
  })
  title: string;

  @ApiProperty({
    description: 'Version description',
    example: 'Major update with new endpoints and improved documentation',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Version content',
    example: { openapi: '3.0.0', info: { title: 'API Documentation v2' } },
  })
  content: any;

  @ApiProperty({
    description: 'Version status',
    enum: DocumentationStatus,
    example: DocumentationStatus.PUBLISHED,
  })
  status: DocumentationStatus;

  @ApiProperty({
    description: 'Version creator ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  creatorId: string;

  @ApiProperty({
    description: 'Version creator name',
    example: 'John Doe',
  })
  creatorName: string;

  @ApiProperty({
    description: 'Version creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Version update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class ExportDocumentationDto {
  @ApiProperty({
    description: 'Export format',
    enum: ExportFormat,
    example: ExportFormat.MARKDOWN,
  })
  format: ExportFormat;

  @ApiProperty({
    description: 'Version number to export',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Version must be a number' })
  @Min(1, { message: 'Version must be at least 1' })
  version?: number;
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