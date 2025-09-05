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
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto, ProjectsListResponseDto, AddProjectFileDto, AddProjectMemberDto, ProjectStatus, ProjectVisibility } from '../../shared/dto/projects.dto';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get user projects',
    description: 'Retrieve all projects for the authenticated user'
  })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiOkResponse({ 
    description: 'Projects retrieved successfully',
    type: ProjectsListResponseDto
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getUserProjects(
    @Request() req,
    @Query() paginationDto: any,
    @Query('status') status?: string,
    @Query('search') search?: string
  ): Promise<ProjectsListResponseDto> {
    return this.projectsService.getUserProjects(req.user.id, paginationDto, status, search);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create new project',
    description: 'Create a new project for the authenticated user'
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateProjectDto })
  @ApiCreatedResponse({ 
    description: 'Project created successfully',
    type: ProjectResponseDto
  })
  @ApiBadRequestResponse({ description: 'Bad request - validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req
  ): Promise<ProjectResponseDto> {
    return this.projectsService.createProject(createProjectDto, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get project details',
    description: 'Retrieve details of a specific project'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiOkResponse({ 
    description: 'Project details retrieved successfully',
    type: ProjectResponseDto
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProject(
    @Param('id') projectId: string,
    @Request() req
  ): Promise<ProjectResponseDto> {
    return this.projectsService.getProject(projectId, req.user.id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update project',
    description: 'Update an existing project'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiOkResponse({ 
    description: 'Project updated successfully',
    type: ProjectResponseDto
  })
  @ApiBadRequestResponse({ description: 'Bad request - validation failed' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - not project owner' })
  async updateProject(
    @Param('id') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req
  ): Promise<ProjectResponseDto> {
    return this.projectsService.updateProject(projectId, updateProjectDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete project',
    description: 'Delete a project and all its associated data'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiOkResponse({ description: 'Project deleted successfully' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - not project owner' })
  async deleteProject(
    @Param('id') projectId: string,
    @Request() req
  ): Promise<void> {
    return this.projectsService.deleteProject(projectId, req.user.id);
  }

  @Get(':id/files')
  @ApiOperation({ 
    summary: 'Get project files',
    description: 'Retrieve all files associated with a project'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiOkResponse({ description: 'Project files retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProjectFiles(
    @Param('id') projectId: string,
    @Request() req
  ): Promise<any> {
    return this.projectsService.getProjectFiles(projectId, req.user.id);
  }

  @Post(':id/files')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Add file to project',
    description: 'Add a new file to an existing project'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiBody({ type: AddProjectFileDto })
  @ApiCreatedResponse({ description: 'File added successfully' })
  @ApiBadRequestResponse({ description: 'Bad request - validation failed' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - not project owner' })
  async addProjectFile(
    @Param('id') projectId: string,
    @Body() addFileDto: AddProjectFileDto,
    @Request() req
  ): Promise<any> {
    return this.projectsService.addProjectFile(projectId, addFileDto, req.user.id);
  }

  @Delete(':id/files/:fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Remove file from project',
    description: 'Remove a file from a project'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiParam({ name: 'fileId', description: 'File ID' })
  @ApiOkResponse({ description: 'File removed successfully' })
  @ApiNotFoundResponse({ description: 'Project or file not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - not project owner' })
  async removeProjectFile(
    @Param('id') projectId: string,
    @Param('fileId') fileId: string,
    @Request() req
  ): Promise<void> {
    return this.projectsService.removeProjectFile(projectId, fileId, req.user.id);
  }

  @Get(':id/members')
  @ApiOperation({ 
    summary: 'Get project members',
    description: 'Retrieve all members of a project'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiOkResponse({ description: 'Project members retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProjectMembers(
    @Param('id') projectId: string,
    @Request() req
  ): Promise<any> {
    return this.projectsService.getProjectMembers(projectId, req.user.id);
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Add member to project',
    description: 'Add a new member to an existing project'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiBody({ type: AddProjectMemberDto })
  @ApiCreatedResponse({ description: 'Member added successfully' })
  @ApiBadRequestResponse({ description: 'Bad request - validation failed' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - not project owner' })
  async addProjectMember(
    @Param('id') projectId: string,
    @Body() addMemberDto: AddProjectMemberDto,
    @Request() req
  ): Promise<any> {
    return this.projectsService.addProjectMember(projectId, addMemberDto, req.user.id);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Remove member from project',
    description: 'Remove a member from a project'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOkResponse({ description: 'Member removed successfully' })
  @ApiNotFoundResponse({ description: 'Project or member not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - not project owner' })
  async removeProjectMember(
    @Param('id') projectId: string,
    @Param('userId') userId: string,
    @Request() req
  ): Promise<void> {
    return this.projectsService.removeProjectMember(projectId, userId, req.user.id);
  }
} 