import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  MinLength, 
  MaxLength, 
  IsUrl,
  IsArray,
  IsObject,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsDateString
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

export class CreateEnvironmentDto {
  @ApiProperty({
    description: 'Environment name',
    example: 'Production',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Environment name must be a string' })
  @MinLength(2, { message: 'Environment name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Environment name must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Base URL for the environment',
    example: 'https://api.example.com/v1',
  })
  @IsUrl({}, { message: 'Base URL must be a valid URL' })
  baseUrl: string;

  @ApiProperty({
    description: 'Environment description',
    example: 'Production environment for live API testing',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(200, { message: 'Description must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Environment variables',
    example: { 'API_KEY': 'your-api-key', 'USER_ID': '12345' },
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject({ message: 'Variables must be an object' })
  variables?: Record<string, string>;
}

export class UpdateEnvironmentDto {
  @ApiProperty({
    description: 'Environment name',
    example: 'Production Updated',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Environment name must be a string' })
  @MinLength(2, { message: 'Environment name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Environment name must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({
    description: 'Base URL for the environment',
    example: 'https://api.example.com/v2',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Base URL must be a valid URL' })
  baseUrl?: string;

  @ApiProperty({
    description: 'Environment description',
    example: 'Updated production environment',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(200, { message: 'Description must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Environment variables',
    example: { 'API_KEY': 'new-api-key', 'USER_ID': '67890' },
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject({ message: 'Variables must be an object' })
  variables?: Record<string, string>;
}

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'API key name',
    example: 'My API Key',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'API key name must be a string' })
  @MinLength(2, { message: 'API key name must be at least 2 characters long' })
  @MaxLength(50, { message: 'API key name must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'API key permissions',
    example: ['read', 'write'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Permissions must be an array' })
  @IsString({ each: true, message: 'Each permission must be a string' })
  permissions?: string[];

  @ApiProperty({
    description: 'API key expiration date',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Expiration date must be a valid date string' })
  expiresAt?: string;
}

export class TestRequestDto {
  @ApiProperty({
    description: 'HTTP method',
    enum: HttpMethod,
    example: HttpMethod.POST,
  })
  @IsEnum(HttpMethod, { message: 'Invalid HTTP method' })
  method: HttpMethod;

  @ApiProperty({
    description: 'Request URL',
    example: '/users/123',
  })
  @IsString({ message: 'URL must be a string' })
  @MinLength(1, { message: 'URL cannot be empty' })
  url: string;

  @ApiProperty({
    description: 'Request headers',
    example: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject({ message: 'Headers must be an object' })
  headers?: Record<string, string>;

  @ApiProperty({
    description: 'Request body',
    example: { 'name': 'John Doe', 'email': 'john@example.com' },
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject({ message: 'Body must be an object' })
  body?: any;

  @ApiProperty({
    description: 'Environment ID for variable substitution',
    example: 'env-123',
  })
  @IsOptional()
  @IsString({ message: 'Environment ID must be a string' })
  environmentId?: string;

  @ApiProperty({
    description: 'Request timeout in milliseconds',
    example: 5000,
    minimum: 1000,
    maximum: 30000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Timeout must be a number' })
  @Min(1000, { message: 'Timeout must be at least 1000ms' })
  @Max(30000, { message: 'Timeout must not exceed 30000ms' })
  timeout?: number;
}

export class PaginationDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number;
}

export class ApiResponseDto {
  @ApiProperty({
    description: 'Response status code',
    example: 200,
  })
  status: number;

  @ApiProperty({
    description: 'Response status text',
    example: 'OK',
  })
  statusText: string;

  @ApiProperty({
    description: 'Response headers',
    example: { 'content-type': 'application/json' },
    additionalProperties: { type: 'string' },
  })
  headers: Record<string, string>;

  @ApiProperty({
    description: 'Response data',
    example: { message: 'Success', data: {} },
    additionalProperties: true,
  })
  data: any;
}

export class RequestResultDto {
  @ApiProperty({
    description: 'Request ID',
    example: 'req-123',
  })
  id: string;

  @ApiProperty({
    description: 'HTTP method',
    example: 'POST',
  })
  method: string;

  @ApiProperty({
    description: 'Request URL',
    example: 'https://api.example.com/users',
  })
  url: string;

  @ApiProperty({
    description: 'Request headers',
    example: { 'Content-Type': 'application/json' },
    additionalProperties: { type: 'string' },
  })
  headers: Record<string, string>;

  @ApiProperty({
    description: 'Request body',
    example: { name: 'John Doe' },
    additionalProperties: true,
  })
  body: any;

  @ApiProperty({
    description: 'Response details',
    type: ApiResponseDto,
  })
  response: ApiResponseDto;

  @ApiProperty({
    description: 'Request timing information',
    example: { startTime: 1640995200000, endTime: 1640995201000, duration: 1000 },
  })
  timing: {
    startTime: number;
    endTime: number;
    duration: number;
  };

  @ApiProperty({
    description: 'Environment ID used',
    example: 'env-123',
  })
  environmentId?: string;

  @ApiProperty({
    description: 'Request creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

// Response DTOs
export class EnvironmentResponseDto {
  @ApiProperty({
    description: 'Environment ID',
    example: 'env-123',
  })
  id: string;

  @ApiProperty({
    description: 'Environment name',
    example: 'Production',
  })
  name: string;

  @ApiProperty({
    description: 'Base URL',
    example: 'https://api.example.com/v1',
  })
  baseUrl: string;

  @ApiProperty({
    description: 'Environment description',
    example: 'Production environment',
  })
  description?: string;

  @ApiProperty({
    description: 'Environment variables',
    example: { 'API_KEY': 'your-api-key' },
    additionalProperties: { type: 'string' },
  })
  variables: Record<string, string>;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class EnvironmentListResponseDto {
  @ApiProperty({
    description: 'List of environments',
    type: [EnvironmentResponseDto],
  })
  environments: EnvironmentResponseDto[];
}

export class ApiKeyResponseDto {
  @ApiProperty({
    description: 'API key ID',
    example: 'key-123',
  })
  id: string;

  @ApiProperty({
    description: 'API key name',
    example: 'My API Key',
  })
  name: string;

  @ApiProperty({
    description: 'API key value',
    example: 'sk_abc123def456',
  })
  key: string;

  @ApiProperty({
    description: 'API key permissions',
    example: ['read', 'write'],
  })
  permissions: string[];

  @ApiProperty({
    description: 'Is API key active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Expiration date',
    example: '2024-12-31T23:59:59.000Z',
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last used timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastUsedAt?: Date;
}

export class ApiKeyListResponseDto {
  @ApiProperty({
    description: 'List of API keys',
    type: [ApiKeyResponseDto],
  })
  apiKeys: ApiKeyResponseDto[];
}

export class RequestHistoryResponseDto {
  @ApiProperty({
    description: 'List of requests',
    type: [RequestResultDto],
  })
  requests: RequestResultDto[];

  @ApiProperty({
    description: 'Pagination information',
    example: { page: 1, limit: 10, total: 50, totalPages: 5 },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class RequestHistoryListResponseDto {
  @ApiProperty({
    description: 'List of request history',
    type: [RequestResultDto],
  })
  requests: RequestResultDto[];
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;
} 