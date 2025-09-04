import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { v4 as uuidv4 } from 'uuid';

// Mock data (replace with Prisma in production)
const projects = new Map();
const projectFiles = new Map();
const projectMemberships = new Map();

@Injectable()
export class ProjectsService {
  constructor(private readonly cacheService: CacheService) {}

  async getUserProjects(
    userId: string, 
    paginationDto: any, 
    status?: string, 
    search?: string
  ): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto;
    
    // Get user's projects
    let userProjects = Array.from(projects.values()).filter(project => project.ownerId === userId);

    // Filter by status
    if (status) {
      userProjects = userProjects.filter(project => project.status === status);
    }

    // Filter by search
    if (search) {
      userProjects = userProjects.filter(project => 
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const total = userProjects.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = userProjects.slice(startIndex, endIndex);

    return {
      projects: paginatedProjects,
      total,
      page,
      limit,
      totalPages
    };
  }

  async createProject(createProjectDto: any, userId: string): Promise<any> {
    const { name, description, figmaFileId, figmaFileName, visibility, tags } = createProjectDto;

    const project = {
      id: uuidv4(),
      name,
      description: description || '',
      ownerId: userId,
      figmaFileId: figmaFileId || null,
      figmaFileName: figmaFileName || null,
      status: 'active',
      visibility: visibility || 'private',
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    projects.set(project.id, project);

    // Cache the project
    await this.cacheService.set(`project:${project.id}`, project, 3600);

    return project;
  }

  async getProject(projectId: string, userId: string): Promise<any> {
    // Try to get from cache first
    let project = await this.cacheService.get(`project:${projectId}`);
    
    if (!project) {
      project = projects.get(projectId);
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      // Cache the project
      await this.cacheService.set(`project:${projectId}`, project, 3600);
    }

    // Check if user has access to the project
    if (project.ownerId !== userId && project.visibility === 'private') {
      throw new ForbiddenException('Access denied');
    }

    return project;
  }

  async updateProject(projectId: string, updateProjectDto: any, userId: string): Promise<any> {
    const project = await this.getProject(projectId, userId);

    // Check if user is the owner
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can update the project');
    }

    // Update project fields
    const updatedProject = {
      ...project,
      ...updateProjectDto,
      updatedAt: new Date(),
    };

    projects.set(projectId, updatedProject);

    // Update cache
    await this.cacheService.set(`project:${projectId}`, updatedProject, 3600);

    return updatedProject;
  }

  async deleteProject(projectId: string, userId: string): Promise<void> {
    const project = await this.getProject(projectId, userId);

    // Check if user is the owner
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can delete the project');
    }

    // Delete project
    projects.delete(projectId);

    // Clear cache
    await this.cacheService.delete(`project:${projectId}`);

    // Delete associated files and memberships
    Array.from(projectFiles.values())
      .filter(file => file.projectId === projectId)
      .forEach(file => projectFiles.delete(file.id));

    Array.from(projectMemberships.values())
      .filter(membership => membership.projectId === projectId)
      .forEach(membership => projectMemberships.delete(membership.id));
  }

  async getProjectFiles(projectId: string, userId: string): Promise<any> {
    // Check if project exists and user has access
    await this.getProject(projectId, userId);
    
    // Get files for this project
    const files = Array.from(projectFiles.values())
      .filter(file => file.projectId === projectId);
    
    return {
      files,
      total: files.length
    };
  }

  async addProjectFile(projectId: string, addFileDto: any, userId: string): Promise<any> {
    // Check if project exists and user has access
    const project = await this.getProject(projectId, userId);
    
    // Check if user is the owner or has write access
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can add files');
    }
    
    const file = {
      id: uuidv4(),
      projectId,
      fileId: addFileDto.fileId,
      fileName: addFileDto.fileName,
      fileUrl: addFileDto.fileUrl,
      fileType: addFileDto.fileType,
      createdAt: new Date(),
    };
    
    // Add to mock data
    projectFiles.set(file.id, file);
    
    return {
      message: 'File added successfully',
      file
    };
  }

  async removeProjectFile(projectId: string, fileId: string, userId: string): Promise<void> {
    // Check if project exists and user has access
    const project = await this.getProject(projectId, userId);
    
    // Check if user is the owner or has write access
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can remove files');
    }
    
    // Check if file exists
    const file = projectFiles.get(fileId);
    if (!file || file.projectId !== projectId) {
      throw new NotFoundException('File not found');
    }
    
    // Remove from mock data
    projectFiles.delete(fileId);
    
    return;
  }

  async getProjectMembers(projectId: string, userId: string): Promise<any> {
    // Check if project exists and user has access
    await this.getProject(projectId, userId);
    
    // Get memberships for this project
    const memberships = Array.from(projectMemberships.values())
      .filter(membership => membership.projectId === projectId);
    
    // Mock user data (in real app, fetch from user service)
    const members = memberships.map(membership => ({
      id: membership.id,
      email: membership.email,
      name: 'User Name', // Mock name
      role: membership.role,
      joinedAt: membership.createdAt
    }));
    
    // Add project owner
    const project = projects.get(projectId);
    if (project) {
      members.unshift({
        id: project.ownerId,
        email: 'owner@example.com', // Mock email
        name: 'Project Owner', // Mock name
        role: 'owner',
        joinedAt: project.createdAt
      });
    }
    
    return {
      members,
      total: members.length
    };
  }

  async addProjectMember(projectId: string, addMemberDto: any, userId: string): Promise<any> {
    // Check if project exists and user has access
    const project = await this.getProject(projectId, userId);
    
    // Check if user is the owner
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can add members');
    }
    
    // Check if member already exists
    const existingMembership = Array.from(projectMemberships.values())
      .find(membership => 
        membership.projectId === projectId && 
        membership.email === addMemberDto.email
      );
    
    if (existingMembership) {
      throw new BadRequestException('Member already exists in this project');
    }
    
    const member = {
      id: uuidv4(),
      projectId,
      email: addMemberDto.email,
      role: addMemberDto.role,
      message: addMemberDto.message,
      createdAt: new Date(),
    };
    
    // Add to mock data
    projectMemberships.set(member.id, member);
    
    return {
      message: 'Member invited successfully',
      member
    };
  }

  async removeProjectMember(projectId: string, memberUserId: string, userId: string): Promise<void> {
    // Check if project exists and user has access
    const project = await this.getProject(projectId, userId);
    
    // Check if user is the owner
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can remove members');
    }
    
    // Check if trying to remove the owner
    if (project.ownerId === memberUserId) {
      throw new BadRequestException('Cannot remove project owner');
    }
    
    // Check if membership exists
    const membership = projectMemberships.get(memberUserId);
    if (!membership || membership.projectId !== projectId) {
      throw new NotFoundException('Member not found in this project');
    }
    
    // Remove from mock data
    projectMemberships.delete(memberUserId);
    
    return;
  }

  async getProjectAnalytics(projectId: string, userId: string): Promise<any> {
    // Check if project exists and user has access
    await this.getProject(projectId, userId);
    
    // Mock analytics data
    return {
      totalFiles: Array.from(projectFiles.values())
        .filter(file => file.projectId === projectId).length,
      totalMembers: Array.from(projectMemberships.values())
        .filter(membership => membership.projectId === projectId).length + 1, // +1 for owner
      lastActivity: new Date(),
      storageUsed: 1024 * 1024, // 1MB mock
      views: 150,
      downloads: 25
    };
  }
} 