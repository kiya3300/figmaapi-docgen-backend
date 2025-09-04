import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsString, 
  IsOptional, 
  MinLength, 
  MaxLength, 
  IsUUID,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsUrl,
  IsArray
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DRAFT = 'draft'
}

export enum ProjectVisibility {
  PRIVATE = 'private',
  TEAM = 'team',
  PUBLIC = 'public'
}

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'E-commerce API Documentation',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'Project name must be a string' })
  @MinLength(3, { message: 'Project name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Project name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Complete API documentation for our e-commerce platform',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Figma file ID',
    example: 'FigmaFileKey123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Figma file ID must be a string' })
  @MaxLength(100, { message: 'Figma file ID must not exceed 100 characters' })
  figmaFileId?: string;

  @ApiProperty({
    description: 'Figma file name',
    example: 'E-commerce Design System',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Figma file name must be a string' })
  @MaxLength(200, { message: 'Figma file name must not exceed 200 characters' })
  figmaFileName?: string;

  @ApiProperty({
    description: 'Project visibility',
    enum: ProjectVisibility,
    example: ProjectVisibility.TEAM,
    required: false,
    default: ProjectVisibility.PRIVATE,
  })
  @IsOptional()
  @IsEnum(ProjectVisibility, { message: 'Invalid visibility specified' })
  visibility?: ProjectVisibility = ProjectVisibility.PRIVATE;

  @ApiProperty({
    description: 'Project tags',
    example: ['api', 'documentation', 'e-commerce'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @MaxLength(50, { each: true, message: 'Each tag must not exceed 50 characters' })
  tags?: string[];
}

export class UpdateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'E-commerce API Documentation v2',
    minLength: 3,
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Project name must be a string' })
  @MinLength(3, { message: 'Project name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Project name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Updated API documentation for our e-commerce platform',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Figma file ID',
    example: 'FigmaFileKey456',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Figma file ID must be a string' })
  @MaxLength(100, { message: 'Figma file ID must not exceed 100 characters' })
  figmaFileId?: string;

  @ApiProperty({
    description: 'Figma file name',
    example: 'Updated E-commerce Design System',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Figma file name must be a string' })
  @MaxLength(200, { message: 'Figma file name must not exceed 200 characters' })
  figmaFileName?: string;

  @ApiProperty({
    description: 'Project status',
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProjectStatus, { message: 'Invalid status specified' })
  status?: ProjectStatus;

  @ApiProperty({
    description: 'Project visibility',
    enum: ProjectVisibility,
    example: ProjectVisibility.TEAM,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProjectVisibility, { message: 'Invalid visibility specified' })
  visibility?: ProjectVisibility;

  @ApiProperty({
    description: 'Project tags',
    example: ['api', 'documentation', 'e-commerce', 'updated'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @MaxLength(50, { each: true, message: 'Each tag must not exceed 50 characters' })
  tags?: string[];
}

export class ProjectResponseDto {
  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Project name',
    example: 'E-commerce API Documentation'
  })
  name: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Complete API documentation for our e-commerce platform'
  })
  description: string;

  @ApiProperty({
    description: 'Project owner ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  ownerId: string;

  @ApiProperty({
    description: 'Figma file ID',
    example: 'FigmaFileKey123'
  })
  figmaFileId: string;

  @ApiProperty({
    description: 'Figma file name',
    example: 'E-commerce Design System'
  })
  figmaFileName: string;

  @ApiProperty({
    description: 'Project status',
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE
  })
  status: ProjectStatus;

  @ApiProperty({
    description: 'Project visibility',
    enum: ProjectVisibility,
    example: ProjectVisibility.TEAM
  })
  visibility: ProjectVisibility;

  @ApiProperty({
    description: 'Project tags',
    example: ['api', 'documentation', 'e-commerce']
  })
  tags: string[];

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
}

export class ProjectsListResponseDto {
  @ApiProperty({
    description: 'List of projects',
    type: [ProjectResponseDto]
  })
  projects: ProjectResponseDto[];

  @ApiProperty({
    description: 'Total number of projects',
    example: 10
  })
  total: number;

  @ApiProperty({
    description: 'Current page',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 1
  })
  totalPages: number;
}

// Add the missing DTOs
export class AddProjectFileDto {
  @ApiProperty({
    description: 'File ID',
    example: 'file123',
    minLength: 1,
    maxLength: 100,
  })
  @IsString({ message: 'File ID must be a string' })
  @MinLength(1, { message: 'File ID must not be empty' })
  @MaxLength(100, { message: 'File ID must not exceed 100 characters' })
  fileId: string;

  @ApiProperty({
    description: 'File name',
    example: 'design.fig',
    minLength: 1,
    maxLength: 200,
  })
  @IsString({ message: 'File name must be a string' })
  @MinLength(1, { message: 'File name must not be empty' })
  @MaxLength(200, { message: 'File name must not exceed 200 characters' })
  fileName: string;

  @ApiProperty({
    description: 'File URL',
    example: 'https://figma.com/file/123',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'File URL must be a valid URL' })
  fileUrl?: string;

  @ApiProperty({
    description: 'File type',
    example: 'fig',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'File type must be a string' })
  fileType?: string;
}

export class AddProjectMemberDto {
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'User role in project',
    example: 'member',
    enum: ['owner', 'admin', 'member', 'viewer']
  })
  @IsString({ message: 'Role must be a string' })
  @IsEnum(['owner', 'admin', 'member', 'viewer'], { message: 'Invalid role specified' })
  role: string;

  @ApiProperty({
    description: 'Invitation message',
    example: 'Please join our project team',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Message must be a string' })
  @MaxLength(500, { message: 'Message must not exceed 500 characters' })
  message?: string;
} 