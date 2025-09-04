import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// Mock data (replace with Prisma in production)
const documentation = new Map();
const documentationVersions = new Map();
const documentationJobs = new Map();

@Injectable()
export class DocumentationService {
  async generateDocumentation(userId: string, generateDocumentationDto: any): Promise<any> {
    const { title, description, projectId, figmaFileId, format, template, tags, analysisOptions } = generateDocumentationDto;

    // Check if project exists and user has access
    // In real app, verify project ownership
    const project = { id: projectId, name: 'Sample Project' }; // Mock project data

    // Check if Figma file exists and user has access
    // In real app, verify Figma file access
    const figmaFile = { id: figmaFileId, name: 'Design System' }; // Mock Figma file data

    // Create documentation job
    const documentationId = uuidv4();
    const docJob = {
      id: documentationId,
      userId,
      title,
      description,
      projectId,
      figmaFileId,
      format: format || 'openapi',
      template: template || 'default',
      tags: tags || [],
      analysisOptions: analysisOptions || {},
      status: 'processing',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    documentationJobs.set(documentationId, docJob);

    // Start documentation generation in background
    this.startDocumentationGeneration(documentationId);

    return {
      message: 'Documentation generation started',
      documentationId,
      status: 'processing',
      success: true,
    };
  }

  async getDocumentation(
    userId: string, 
    paginationDto: any, 
    projectId?: string, 
    status?: string, 
    search?: string
  ): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto;
    
    // Get user's documentation
    let docs = Array.from(documentation.values())
      .filter(doc => doc.ownerId === userId);

    // Filter by project
    if (projectId) {
      docs = docs.filter(doc => doc.projectId === projectId);
    }

    // Filter by status
    if (status) {
      docs = docs.filter(doc => doc.status === 'published');
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      docs = docs.filter(doc => 
        doc.title.toLowerCase().includes(searchLower) ||
        doc.description?.toLowerCase().includes(searchLower) ||
        doc.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Add additional data
    const enrichedDocs = docs.map(doc => ({
      ...doc,
      totalVersions: this.getDocumentationVersionCount(doc.id),
      lastActivityAt: doc.updatedAt,
    }));

    // Sort by last activity
    enrichedDocs.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDocs = enrichedDocs.slice(startIndex, endIndex);

    return {
      data: paginatedDocs,
      pagination: {
        page,
        limit,
        total: enrichedDocs.length,
        pages: Math.ceil(enrichedDocs.length / limit),
      },
    };
  }

  async getDocumentationById(userId: string, documentationId: string): Promise<any> {
    const doc = documentation.get(documentationId);
    
    if (!doc) {
      throw new NotFoundException('Documentation not found');
    }

    // Check if user has access to this documentation
    if (doc.ownerId !== userId) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return {
      ...doc,
      totalVersions: this.getDocumentationVersionCount(doc.id),
      lastActivityAt: doc.updatedAt,
    };
  }

  async updateDocumentation(userId: string, documentationId: string, updateDocumentationDto: any): Promise<any> {
    const doc = documentation.get(documentationId);
    
    if (!doc) {
      throw new NotFoundException('Documentation not found');
    }

    // Check if user is the owner
    if (doc.ownerId !== userId) {
      throw new ForbiddenException('Only documentation owner can update the documentation');
    }

    // Update documentation
    const updatedDoc = {
      ...doc,
      ...updateDocumentationDto,
      updatedAt: new Date(),
    };

    documentation.set(documentationId, updatedDoc);

    return {
      ...updatedDoc,
      totalVersions: this.getDocumentationVersionCount(doc.id),
      lastActivityAt: updatedDoc.updatedAt,
    };
  }

  async deleteDocumentation(userId: string, documentationId: string): Promise<any> {
    const doc = documentation.get(documentationId);
    
    if (!doc) {
      throw new NotFoundException('Documentation not found');
    }

    // Check if user is the owner
    if (doc.ownerId !== userId) {
      throw new ForbiddenException('Only documentation owner can delete the documentation');
    }

    // Delete documentation and related data
    documentation.delete(documentationId);
    
    // Delete documentation versions
    Array.from(documentationVersions.values())
      .filter(version => version.documentationId === documentationId)
      .forEach(version => documentationVersions.delete(version.id));

    return {
      message: 'Documentation deleted successfully',
      success: true,
    };
  }

  async exportDocumentation(
    userId: string, 
    documentationId: string, 
    format: string, 
    version?: number
  ): Promise<any> {
    const doc = documentation.get(documentationId);
    
    if (!doc) {
      throw new NotFoundException('Documentation not found');
    }

    // Check if user has access to this documentation
    if (doc.ownerId !== userId) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Get specific version or current version
    let content = doc.content;
    let versionNumber = doc.currentVersion;

    if (version) {
      const versionDoc = Array.from(documentationVersions.values())
        .find(v => v.documentationId === documentationId && v.version === version);
      
      if (!versionDoc) {
        throw new NotFoundException('Version not found');
      }
      
      content = versionDoc.content;
      versionNumber = version;
    }

    // Convert content to requested format
    const exportedContent = this.convertToFormat(content, format);
    const filename = `${doc.title.toLowerCase().replace(/\s+/g, '-')}-v${versionNumber}.${this.getFileExtension(format)}`;

    return {
      content: exportedContent,
      format,
      filename,
      size: exportedContent.length,
    };
  }

  async createVersion(userId: string, documentationId: string): Promise<any> {
    const doc = documentation.get(documentationId);
    
    if (!doc) {
      throw new NotFoundException('Documentation not found');
    }

    // Check if user is the owner
    if (doc.ownerId !== userId) {
      throw new ForbiddenException('Only documentation owner can create versions');
    }

    // Get next version number
    const nextVersion = doc.currentVersion + 1;

    // Create new version
    const version = {
      id: uuidv4(),
      documentationId,
      version: nextVersion,
      title: `v${nextVersion}.0.0`,
      description: `Version ${nextVersion} of ${doc.title}`,
      content: doc.content,
      status: 'draft',
      creatorId: userId,
      creatorName: 'John Doe', // Mock user data
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    documentationVersions.set(version.id, version);

    // Update documentation current version
    const updatedDoc = {
      ...doc,
      currentVersion: nextVersion,
      updatedAt: new Date(),
    };

    documentation.set(documentationId, updatedDoc);

    return version;
  }

  async getVersions(userId: string, documentationId: string, paginationDto: any): Promise<any> {
    const doc = documentation.get(documentationId);
    
    if (!doc) {
      throw new NotFoundException('Documentation not found');
    }

    // Check if user has access to this documentation
    if (doc.ownerId !== userId) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const { page = 1, limit = 10 } = paginationDto;
    
    // Get documentation versions
    const versions = Array.from(documentationVersions.values())
      .filter(version => version.documentationId === documentationId)
      .sort((a, b) => b.version - a.version);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVersions = versions.slice(startIndex, endIndex);

    return {
      data: paginatedVersions,
      pagination: {
        page,
        limit,
        total: versions.length,
        pages: Math.ceil(versions.length / limit),
      },
    };
  }

  async getDocumentationVersion(userId: string, documentationId: string, versionId: string): Promise<any> {
    const doc = documentation.get(documentationId);
    
    if (!doc) {
      throw new NotFoundException('Documentation not found');
    }

    // Check if user has access to this documentation
    if (doc.ownerId !== userId) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Get specific version
    const version = Array.from(documentationVersions.values())
      .find(v => v.documentationId === documentationId && v.id === versionId);

    if (!version) {
      throw new NotFoundException('Documentation version not found');
    }

    return {
      ...version,
      documentation: {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        projectId: doc.projectId,
        figmaFileId: doc.figmaFileId,
        status: doc.status,
        isPublic: doc.isPublic,
        publicUrl: doc.publicUrl,
      },
    };
  }

  async publishDocumentation(userId: string, documentationId: string): Promise<any> {
    const doc = documentation.get(documentationId);
    
    if (!doc) {
      throw new NotFoundException('Documentation not found');
    }

    // Check if user is the owner
    if (doc.ownerId !== userId) {
      throw new ForbiddenException('Only documentation owner can publish the documentation');
    }

    // Update documentation status
    const updatedDoc = {
      ...doc,
      status: 'published',
      isPublic: true,
      publicUrl: `https://docs.example.com/api-docs/${documentationId}`,
      updatedAt: new Date(),
    };

    documentation.set(documentationId, updatedDoc);

    return {
      message: 'Documentation published successfully',
      success: true,
    };
  }

  async unpublishDocumentation(userId: string, documentationId: string): Promise<any> {
    const doc = documentation.get(documentationId);
    
    if (!doc) {
      throw new NotFoundException('Documentation not found');
    }

    // Check if user is the owner
    if (doc.ownerId !== userId) {
      throw new ForbiddenException('Only documentation owner can unpublish the documentation');
    }

    // Update documentation status
    const updatedDoc = {
      ...doc,
      status: 'draft',
      isPublic: false,
      publicUrl: undefined,
      updatedAt: new Date(),
    };

    documentation.set(documentationId, updatedDoc);

    return {
      message: 'Documentation unpublished successfully',
      success: true,
    };
  }

  // Helper methods
  private getDocumentationVersionCount(documentationId: string): number {
    return Array.from(documentationVersions.values())
      .filter(version => version.documentationId === documentationId).length;
  }

  private convertToFormat(content: any, format: string): string {
    switch (format) {
      case 'openapi':
        return this.convertToOpenAPI(content);
      case 'json':
        return JSON.stringify(content, null, 2);
      case 'markdown':
        return this.convertToMarkdown(content);
      case 'html':
        return this.convertToHTML(content);
      default:
        return JSON.stringify(content, null, 2);
    }
  }

  private convertToOpenAPI(content: any): string {
    // Mock OpenAPI conversion
    return `openapi: 3.0.0
info:
  title: ${content.info?.title || 'API Documentation'}
  version: ${content.info?.version || '1.0.0'}
  description: ${content.info?.description || 'Generated API documentation'}
paths:
  /api/example:
    get:
      summary: Example endpoint
      responses:
        '200':
          description: Successful response`;
  }

  private convertToMarkdown(content: any): string {
    // Mock Markdown conversion
    return `# ${content.info?.title || 'API Documentation'}

## Overview
${content.info?.description || 'Generated API documentation'}

## Endpoints

### GET /api/example
Example endpoint

**Response:**
\`\`\`json
{
  "message": "Success"
}
\`\`\``;
  }

  private convertToHTML(content: any): string {
    // Mock HTML conversion
    return `<!DOCTYPE html>
<html>
<head>
    <title>${content.info?.title || 'API Documentation'}</title>
</head>
<body>
    <h1>${content.info?.title || 'API Documentation'}</h1>
    <p>${content.info?.description || 'Generated API documentation'}</p>
</body>
</html>`;
  }

  private getFileExtension(format: string): string {
    switch (format) {
      case 'openapi':
        return 'yaml';
      case 'json':
        return 'json';
      case 'markdown':
        return 'md';
      case 'html':
        return 'html';
      default:
        return 'json';
    }
  }

  private async startDocumentationGeneration(documentationId: string): Promise<void> {
    const docJob = documentationJobs.get(documentationId);
    if (!docJob) return;

    // Simulate documentation generation process
    docJob.status = 'processing';
    docJob.progress = 10;
    documentationJobs.set(documentationId, docJob);

    setTimeout(() => {
      docJob.progress = 50;
      documentationJobs.set(documentationId, docJob);
    }, 2000);

    setTimeout(() => {
      docJob.status = 'completed';
      docJob.progress = 100;
      documentationJobs.set(documentationId, docJob);

      // Create the actual documentation
      const doc = {
        id: documentationId,
        title: docJob.title,
        description: docJob.description,
        projectId: docJob.projectId,
        projectName: 'Sample Project',
        figmaFileId: docJob.figmaFileId,
        figmaFileName: 'Design System',
        format: docJob.format,
        template: docJob.template,
        content: {
          openapi: '3.0.0',
          info: {
            title: docJob.title,
            description: docJob.description,
            version: '1.0.0',
          },
          paths: {
            '/api/example': {
              get: {
                summary: 'Example endpoint',
                responses: {
                  '200': {
                    description: 'Successful response',
                  },
                },
              },
            },
          },
        },
        status: 'draft',
        tags: docJob.tags,
        isPublic: false,
        currentVersion: 1,
        ownerId: docJob.userId,
        ownerName: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      documentation.set(documentationId, doc);
    }, 5000);
  }

  // Mock data initialization
  initializeMockData() {
    // Create sample documentation
    const sampleDocs = [
      {
        id: uuidv4(),
        title: 'E-commerce API Documentation',
        description: 'Complete API documentation for our e-commerce platform',
        projectId: 'project-123',
        projectName: 'E-commerce API',
        figmaFileId: 'FigmaFileKey123',
        figmaFileName: 'E-commerce Design System',
        format: 'openapi',
        template: 'default',
        content: {
          openapi: '3.0.0',
          info: {
            title: 'E-commerce API Documentation',
            description: 'Complete API documentation for our e-commerce platform',
            version: '1.0.0',
          },
          paths: {
            '/api/products': {
              get: {
                summary: 'Get products',
                responses: {
                  '200': {
                    description: 'Successful response',
                  },
                },
              },
            },
          },
        },
        status: 'published',
        tags: ['api', 'e-commerce', 'v1'],
        isPublic: true,
        currentVersion: 1,
        ownerId: 'user1',
        ownerName: 'John Doe',
        publicUrl: 'https://docs.example.com/api-docs/doc-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
    ];

    sampleDocs.forEach(doc => {
      documentation.set(doc.id, doc);
    });
  }
} 