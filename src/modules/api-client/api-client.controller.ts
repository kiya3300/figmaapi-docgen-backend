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
import { ApiClientService } from './api-client.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateEnvironmentDto,
  UpdateEnvironmentDto,
  CreateApiKeyDto,
  TestRequestDto,
  PaginationDto,
  EnvironmentResponseDto,
  EnvironmentListResponseDto,
  ApiKeyResponseDto,
  ApiKeyListResponseDto,
  RequestResultDto,
  RequestHistoryResponseDto,
  RequestHistoryListResponseDto,
  MessageResponseDto
} from '@/shared/dto/api-client.dto';

@ApiTags('API Client Testing')
@Controller('api-client')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApiClientController {
  constructor(private readonly apiClientService: ApiClientService) {}

  @Post('environments')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new environment' })
  @ApiBody({ type: CreateEnvironmentDto })
  @ApiCreatedResponse({
    description: 'Environment created successfully',
    type: EnvironmentResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createEnvironment(
    @Request() req,
    @Body() createEnvironmentDto: CreateEnvironmentDto,
  ): Promise<EnvironmentResponseDto> {
    return this.apiClientService.createEnvironment(req.user.id, createEnvironmentDto);
  }

  @Get('environments')
  @ApiOperation({ summary: 'Get user environments' })
  @ApiOkResponse({
    description: 'Environments retrieved successfully',
    type: EnvironmentListResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getUserEnvironments(@Request() req): Promise<EnvironmentListResponseDto> {
    const environments = await this.apiClientService.getUserEnvironments(req.user.id);
    return { environments };
  }

  @Put('environments/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update environment' })
  @ApiParam({ name: 'id', description: 'Environment ID' })
  @ApiBody({ type: UpdateEnvironmentDto })
  @ApiOkResponse({
    description: 'Environment updated successfully',
    type: EnvironmentResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Environment not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateEnvironment(
    @Request() req,
    @Param('id') id: string,
    @Body() updateEnvironmentDto: UpdateEnvironmentDto,
  ): Promise<EnvironmentResponseDto> {
    return this.apiClientService.updateEnvironment(req.user.id, id, updateEnvironmentDto);
  }

  @Delete('environments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete environment' })
  @ApiParam({ name: 'id', description: 'Environment ID' })
  @ApiOkResponse({ description: 'Environment deleted successfully' })
  @ApiNotFoundResponse({ description: 'Environment not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async deleteEnvironment(
    @Request() req,
    @Param('id') id: string,
  ): Promise<void> {
    return this.apiClientService.deleteEnvironment(req.user.id, id);
  }

  @Get('keys')
  @ApiOperation({ 
    summary: 'List API keys',
    description: 'Retrieve all API keys for the authenticated user'
  })
  @ApiOkResponse({
    description: 'API keys retrieved successfully',
    type: ApiKeyListResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getApiKeys(@Request() req): Promise<ApiKeyListResponseDto> {
    const apiKeys = await this.apiClientService.getUserApiKeys(req.user.id); // Changed from getApiKeys to getUserApiKeys
    return { apiKeys };
  }

  @Post('keys')
  @ApiOperation({ 
    summary: 'Create API key',
    description: 'Create a new API key for the authenticated user'
  })
  @ApiBody({ type: CreateApiKeyDto })
  @ApiOkResponse({
    description: 'API key created successfully',
    type: ApiKeyResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createApiKey(
    @Request() req,
    @Body() createApiKeyDto: CreateApiKeyDto,
  ): Promise<ApiKeyResponseDto> {
    return this.apiClientService.createApiKey(req.user.id, createApiKeyDto);
  }

  @Delete('keys/:id')
  @ApiOperation({ 
    summary: 'Delete API key',
    description: 'Delete a specific API key'
  })
  @ApiParam({ name: 'id', description: 'API key ID' })
  @ApiOkResponse({ description: 'API key deleted successfully' })
  @ApiNotFoundResponse({ description: 'API key not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async deleteApiKey(
    @Request() req,
    @Param('id') id: string,
  ): Promise<void> {
    return this.apiClientService.revokeApiKey(req.user.id, id); // Changed from deleteApiKey to revokeApiKey
  }

  @Post('test')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Test API request' })
  @ApiBody({ type: TestRequestDto })
  @ApiOkResponse({
    description: 'Request test completed',
    type: RequestResultDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async testRequest(
    @Request() req,
    @Body() testRequestDto: TestRequestDto,
  ): Promise<RequestResultDto> {
    return this.apiClientService.testRequest(req.user.id, testRequestDto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get request history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'Request history retrieved successfully',
    type: RequestHistoryResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getRequestHistory(
    @Request() req,
    @Query() paginationDto: PaginationDto,
  ): Promise<RequestHistoryResponseDto> {
    return this.apiClientService.getRequestHistory(req.user.id, paginationDto);
  }

  @Get('history/:id')
  @ApiOperation({ summary: 'Get request details' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiOkResponse({
    description: 'Request details retrieved successfully',
    type: RequestResultDto,
  })
  @ApiNotFoundResponse({ description: 'Request not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getRequestDetails(
    @Request() req,
    @Param('id') id: string,
  ): Promise<RequestResultDto> {
    return this.apiClientService.getRequestDetails(req.user.id, id);
  }

  @Delete('history/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete request from history' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiOkResponse({ description: 'Request deleted successfully' })
  @ApiNotFoundResponse({ description: 'Request not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async deleteRequestHistory(
    @Request() req,
    @Param('id') id: string,
  ): Promise<void> {
    return this.apiClientService.deleteRequestHistory(req.user.id, id);
  }

  @Delete('history')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear all request history' })
  @ApiOkResponse({ description: 'All history cleared successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async clearAllHistory(@Request() req): Promise<void> {
    return this.apiClientService.clearAllHistory(req.user.id);
  }
} 