import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { v4 as uuidv4 } from 'uuid';

// Mock data (replace with Prisma in production)
const figmaConnections = new Map();
const figmaFiles = new Map();
const figmaComponents = new Map();
const analysisJobs = new Map();

interface AnalysisJob {
  id: string;
  userId: string;
  fileId: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  options: any;
  result?: any;
  completedAt?: Date;
}

@Injectable()
export class FigmaService {
  constructor(private readonly cacheService: CacheService) {}

  async connectAccount(userId: string, connectFigmaDto: any): Promise<any> {
    const { accessToken, teamId } = connectFigmaDto;

    // Validate Figma access token (in real app, make API call to Figma)
    if (!this.isValidFigmaToken(accessToken)) {
      throw new BadRequestException('Invalid Figma access token');
    }

    const connection = {
      id: uuidv4(),
      userId,
      accessToken,
      teamId,
      status: 'connected',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    figmaConnections.set(connection.id, connection);

    // Cache the connection
    await this.cacheService.set(`figma:connection:${connection.id}`, connection, 3600);

    return {
      message: 'Figma account connected successfully',
      connection: {
        id: connection.id,
        teamId: connection.teamId,
        status: connection.status,
        createdAt: connection.createdAt,
      }
    };
  }

  async getConnections(userId: string): Promise<any> {
    // Get user's Figma connections
    const connections = Array.from(figmaConnections.values())
      .filter(connection => connection.userId === userId)
      .map(connection => ({
        id: connection.id,
        teamId: connection.teamId,
        status: connection.status,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
      }));

    return {
      connections,
      total: connections.length
    };
  }

  // Primary connection methods (no connectionId)
  async getConnection(userId: string): Promise<any> {
    // Get user's primary Figma connection
    const connection = Array.from(figmaConnections.values())
      .find(conn => conn.userId === userId);

    if (!connection) {
      throw new NotFoundException('No Figma connection found for this user');
    }

    return {
      id: connection.id,
      teamId: connection.teamId,
      status: connection.status,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };
  }

  async disconnectAccount(userId: string): Promise<any> {
    // Find user's Figma connection
    const connection = Array.from(figmaConnections.values())
      .find(conn => conn.userId === userId);

    if (!connection) {
      throw new NotFoundException('No Figma connection found for this user');
    }

    // Remove connection
    figmaConnections.delete(connection.id);

    // Clear cache
    await this.cacheService.delete(`figma:connection:${connection.id}`);

    return {
      message: 'Figma account disconnected successfully'
    };
  }

  // Specific connection methods (with connectionId)
  async getConnectionById(connectionId: string, userId: string): Promise<any> {
    // Try to get from cache first
    let connection = await this.cacheService.get(`figma:connection:${connectionId}`);
    
    if (!connection) {
      connection = figmaConnections.get(connectionId);
      if (!connection) {
        throw new NotFoundException('Figma connection not found');
      }
      // Cache the connection
      await this.cacheService.set(`figma:connection:${connectionId}`, connection, 3600);
    }

    // Check if user owns this connection
    if (connection.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      id: connection.id,
      teamId: connection.teamId,
      status: connection.status,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };
  }

  async disconnectAccountById(connectionId: string, userId: string): Promise<any> {
    const connection = await this.getConnectionById(connectionId, userId);

    // Remove connection
    figmaConnections.delete(connectionId);

    // Clear cache
    await this.cacheService.delete(`figma:connection:${connectionId}`);

    return {
      message: 'Figma account disconnected successfully'
    };
  }

  async getFiles(userId: string, paginationDto?: any, search?: string, type?: string): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto || {};
    
    // Get user's Figma files (mock data)
    let files = [
      {
        id: 'figma-file-1',
        name: 'Design System',
        thumbnailUrl: 'https://figma.com/thumbnails/file1.png',
        lastModified: new Date(),
        version: '1.0.0',
        teamId: 'team-1',
        type: 'design-system',
      },
      {
        id: 'figma-file-2',
        name: 'Mobile App Design',
        thumbnailUrl: 'https://figma.com/thumbnails/file2.png',
        lastModified: new Date(),
        version: '2.1.0',
        teamId: 'team-1',
        type: 'mobile-app',
      },
      {
        id: 'figma-file-3',
        name: 'Web Dashboard',
        thumbnailUrl: 'https://figma.com/thumbnails/file3.png',
        lastModified: new Date(),
        version: '1.5.0',
        teamId: 'team-1',
        type: 'web-dashboard',
      }
    ];

    // Filter by search
    if (search) {
      files = files.filter(file => 
        file.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by type
    if (type) {
      files = files.filter(file => file.type === type);
    }

    // Pagination
    const total = files.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = files.slice(startIndex, endIndex);

    return {
      files: paginatedFiles,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getFile(userId: string, fileId: string): Promise<any> {
    // Mock file data
    const file = {
      id: fileId,
      name: 'Design System',
      thumbnailUrl: 'https://figma.com/thumbnails/file1.png',
      lastModified: new Date(),
      version: '1.0.0',
      teamId: 'team-1',
      type: 'design-system',
      document: {
        children: [
          {
            id: 'page-1',
            name: 'Page 1',
            type: 'PAGE',
            children: [
              {
                id: 'frame-1',
                name: 'Button Component',
                type: 'FRAME',
                children: []
              }
            ]
          }
        ]
      }
    };

    if (!file) {
      throw new NotFoundException('Figma file not found');
    }

    return file;
  }

  async analyzeFile(userId: string, analyzeFileDto: any): Promise<any> {
    const { fileId, options } = analyzeFileDto;

    // Check if file exists
    const file = await this.getFile(userId, fileId);
    if (!file) {
      throw new NotFoundException('Figma file not found');
    }

    // Create analysis job
    const job: AnalysisJob = {
      id: uuidv4(),
      userId,
      fileId,
      status: 'processing',
      createdAt: new Date(),
      options: options || {},
    };

    analysisJobs.set(job.id, job);

    // Simulate analysis processing
    setTimeout(async () => {
      job.status = 'completed';
      job.result = {
        components: [
          {
            id: 'button-primary',
            name: 'Button Primary',
            type: 'COMPONENT',
            properties: {
              variant: 'primary',
              size: 'medium',
              state: 'default'
            }
          }
        ],
        styles: {
          colors: ['#007AFF', '#FF3B30', '#34C759'],
          typography: ['Inter', 'SF Pro Display'],
          spacing: [4, 8, 16, 24, 32]
        },
        patterns: ['button', 'form', 'navigation']
      };
      job.completedAt = new Date();
      analysisJobs.set(job.id, job);
    }, 2000);

    return {
      message: 'File analysis started',
      jobId: job.id,
      status: job.status
    };
  }

  async getComponents(userId: string, paginationDto?: any, fileId?: string, search?: string, type?: string): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto || {};

    let components = [
      {
        id: 'button-primary',
        name: 'Button Primary',
        type: 'COMPONENT',
        fileId: 'figma-file-1',
        properties: {
          variant: 'primary',
          size: 'medium',
          state: 'default'
        },
        createdAt: new Date(),
      },
      {
        id: 'input-field',
        name: 'Input Field',
        type: 'COMPONENT',
        fileId: 'figma-file-1',
        properties: {
          type: 'text',
          size: 'medium',
          state: 'default'
        },
        createdAt: new Date(),
      },
      {
        id: 'card-component',
        name: 'Card Component',
        type: 'COMPONENT',
        fileId: 'figma-file-2',
        properties: {
          variant: 'default',
          size: 'medium',
          elevation: 'low'
        },
        createdAt: new Date(),
      }
    ];

    // Filter by fileId
    if (fileId) {
      components = components.filter(comp => comp.fileId === fileId);
    }

    // Filter by search
    if (search) {
      components = components.filter(comp => 
        comp.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by type
    if (type) {
      components = components.filter(comp => comp.type === type);
    }

    // Pagination
    const total = components.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComponents = components.slice(startIndex, endIndex);

    return {
      components: paginatedComponents,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getComponent(userId: string, componentId: string): Promise<any> {
    // Mock component data
    const component = {
      id: componentId,
      name: 'Button Primary',
      type: 'COMPONENT',
      fileId: 'figma-file-1',
      properties: {
        variant: 'primary',
        size: 'medium',
        state: 'default'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      description: 'Primary button component with different states',
      variants: [
        {
          id: 'button-primary-small',
          name: 'Small',
          properties: { size: 'small' }
        },
        {
          id: 'button-primary-large',
          name: 'Large',
          properties: { size: 'large' }
        }
      ]
    };

    if (!component) {
      throw new NotFoundException('Component not found');
    }

    return component;
  }

  async getAnalysisStatus(userId: string, analysisId: string): Promise<any> {
    const job = analysisJobs.get(analysisId);
    if (!job) {
      throw new NotFoundException('Analysis job not found');
    }

    // Check if user owns this job
    if (job.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      id: job.id,
      status: job.status,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      result: job.result,
      progress: job.status === 'completed' ? 100 : 
                job.status === 'processing' ? 50 : 0
    };
  }

  async handleWebhook(webhookData: any): Promise<any> {
    const { event, fileId, teamId } = webhookData;

    // Process webhook based on event type
    switch (event) {
      case 'file_update':
        // Update cached file data
        await this.cacheService.delete(`figma:file:${fileId}`);
        break;
      case 'file_delete':
        // Remove file from cache
        await this.cacheService.delete(`figma:file:${fileId}`);
        break;
      case 'team_update':
        // Update team information
        await this.cacheService.delete(`figma:team:${teamId}`);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return {
      message: 'Webhook processed successfully',
      event,
      fileId,
      teamId
    };
  }

  private isValidFigmaToken(token: string): boolean {
    // Mock validation - in real app, make API call to Figma
    return token && token.length > 10;
  }

  async getFileAnalytics(fileId: string, userId: string): Promise<any> {
    // Check if file exists
    await this.getFile(userId, fileId);

    // Mock analytics data
    return {
      totalComponents: 25,
      totalStyles: 15,
      totalPages: 8,
      lastModified: new Date(),
      version: '1.0.0',
      collaborators: 3,
      views: 150,
      downloads: 25
    };
  }
} 