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
  IsUrl,
  IsArray,
  IsBoolean
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum FigmaConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  EXPIRED = 'expired',
  ERROR = 'error'
}

export enum FigmaFileType {
  FILE = 'file',
  PROJECT = 'project'
}

export enum FigmaComponentType {
  COMPONENT = 'COMPONENT',
  COMPONENT_SET = 'COMPONENT_SET',
  INSTANCE = 'INSTANCE'
}

export enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export class ConnectFigmaDto {
  @ApiProperty({
    description: 'Figma access token',
    example: 'figd_example_token_placeholder_123456789', // Changed from actual token pattern
    minLength: 20,
    maxLength: 100,
  })
  @IsString({ message: 'Access token must be a string' })
  @MinLength(20, { message: 'Access token must be at least 20 characters long' })
  @MaxLength(100, { message: 'Access token must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  accessToken: string;

  @ApiProperty({
    description: 'Figma team ID (optional)',
    example: 'team123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Team ID must be a string' })
  @MaxLength(50, { message: 'Team ID must not exceed 50 characters' })
  teamId?: string;
}

export class AnalyzeFigmaFileDto {
  @ApiProperty({
    description: 'Figma file ID to analyze',
    example: 'FigmaFileKey123',
  })
  @IsString({ message: 'File ID must be a string' })
  @MinLength(10, { message: 'File ID must be at least 10 characters long' })
  @MaxLength(50, { message: 'File ID must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  fileId: string;

  @ApiProperty({
    description: 'Analysis options',
    example: {
      includeComponents: true,
      includeStyles: true,
      includeFrames: false,
      generateApiDocs: true
    },
    required: false,
  })
  @IsOptional()
  analysisOptions?: {
    includeComponents?: boolean;
    includeStyles?: boolean;
    includeFrames?: boolean;
    generateApiDocs?: boolean;
  };

  @ApiProperty({
    description: 'Project ID to associate with the analysis',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Project ID must be a string' })
  projectId?: string;
}

export class FigmaConnectionResponseDto {
  @ApiProperty({
    description: 'Connection status',
    enum: FigmaConnectionStatus,
    example: FigmaConnectionStatus.CONNECTED,
  })
  status: FigmaConnectionStatus;

  @ApiProperty({
    description: 'Figma user ID',
    example: 'figma-user-123',
    required: false,
  })
  figmaUserId?: string;

  @ApiProperty({
    description: 'Figma user email',
    example: 'user@figma.com',
    required: false,
  })
  figmaUserEmail?: string;

  @ApiProperty({
    description: 'Figma user name',
    example: 'John Doe',
    required: false,
  })
  figmaUserName?: string;

  @ApiProperty({
    description: 'Figma team ID',
    example: 'team123',
    required: false,
  })
  teamId?: string;

  @ApiProperty({
    description: 'Connection creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last connection update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Token expiration date',
    example: '2024-12-31T00:00:00.000Z',
    required: false,
  })
  expiresAt?: Date;
}

export class FigmaFileResponseDto {
  @ApiProperty({
    description: 'Figma file ID',
    example: 'FigmaFileKey123',
  })
  id: string;

  @ApiProperty({
    description: 'File name',
    example: 'E-commerce Design System',
  })
  name: string;

  @ApiProperty({
    description: 'File thumbnail URL',
    example: 'https://figma.com/thumbnails/file123.png',
    required: false,
  })
  thumbnailUrl?: string;

  @ApiProperty({
    description: 'File version',
    example: 'v1.2.3',
  })
  version: string;

  @ApiProperty({
    description: 'Last modified date',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastModified: Date;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'Number of components in the file',
    example: 150,
  })
  componentCount: number;

  @ApiProperty({
    description: 'Number of pages in the file',
    example: 5,
  })
  pageCount: number;

  @ApiProperty({
    description: 'File type',
    enum: FigmaFileType,
    example: FigmaFileType.FILE,
  })
  type: FigmaFileType;

  @ApiProperty({
    description: 'File URL',
    example: 'https://figma.com/file/FigmaFileKey123',
  })
  url: string;

  @ApiProperty({
    description: 'File status',
    example: 'synced',
  })
  status: string;

  @ApiProperty({
    description: 'Last sync date',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastSyncedAt: Date;
}

export class FigmaFileListResponseDto {
  @ApiProperty({
    description: 'Array of Figma files',
    type: [FigmaFileResponseDto],
  })
  data: FigmaFileResponseDto[];

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

export class FigmaComponentResponseDto {
  @ApiProperty({
    description: 'Figma component ID',
    example: 'ComponentKey123',
  })
  id: string;

  @ApiProperty({
    description: 'Component name',
    example: 'Button/Primary',
  })
  name: string;

  @ApiProperty({
    description: 'Component description',
    example: 'Primary button component with hover states',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Component type',
    enum: FigmaComponentType,
    example: FigmaComponentType.COMPONENT,
  })
  type: FigmaComponentType;

  @ApiProperty({
    description: 'Component key',
    example: 'component-key-123',
  })
  key: string;

  @ApiProperty({
    description: 'Component file ID',
    example: 'FigmaFileKey123',
  })
  fileId: string;

  @ApiProperty({
    description: 'Component file name',
    example: 'Design System',
  })
  fileName: string;

  @ApiProperty({
    description: 'Component thumbnail URL',
    example: 'https://figma.com/thumbnails/component123.png',
    required: false,
  })
  thumbnailUrl?: string;

  @ApiProperty({
    description: 'Component properties',
    example: {
      variant: ['primary', 'secondary'],
      size: ['small', 'medium', 'large'],
      disabled: [true, false]
    },
    required: false,
  })
  properties?: Record<string, any>;

  @ApiProperty({
    description: 'Component documentation',
    example: 'This is a primary button component used for main actions',
    required: false,
  })
  documentation?: string;

  @ApiProperty({
    description: 'Component tags',
    example: ['button', 'primary', 'action'],
    type: [String],
    required: false,
  })
  tags?: string[];

  @ApiProperty({
    description: 'Last modified date',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastModified: Date;

  @ApiProperty({
    description: 'Component URL',
    example: 'https://figma.com/file/FigmaFileKey123?node-id=ComponentKey123',
  })
  url: string;
}

export class FigmaComponentListResponseDto {
  @ApiProperty({
    description: 'Array of Figma components',
    type: [FigmaComponentResponseDto],
  })
  data: FigmaComponentResponseDto[];

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