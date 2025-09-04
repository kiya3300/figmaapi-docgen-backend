import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// Mock data (replace with Prisma in production)
const apiEnvironments = new Map();
const apiRequests = new Map();
const apiKeys = new Map();
const requestHistory = new Map();

@Injectable()
export class ApiClientService {
  async createEnvironment(userId: string, createEnvironmentDto: any): Promise<any> {
    const { name, baseUrl, description, variables } = createEnvironmentDto;

    const environment = {
      id: uuidv4(),
      userId,
      name,
      baseUrl,
      description,
      variables: variables || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    apiEnvironments.set(environment.id, environment);
    return environment;
  }

  async getUserEnvironments(userId: string): Promise<any[]> {
    return Array.from(apiEnvironments.values())
      .filter(env => env.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateEnvironment(userId: string, environmentId: string, updateEnvironmentDto: any): Promise<any> {
    const environment = apiEnvironments.get(environmentId);
    if (!environment) {
      throw new NotFoundException('Environment not found');
    }
    if (environment.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    const updatedEnvironment = {
      ...environment,
      ...updateEnvironmentDto,
      updatedAt: new Date()
    };

    apiEnvironments.set(environmentId, updatedEnvironment);
    return updatedEnvironment;
  }

  async deleteEnvironment(userId: string, environmentId: string): Promise<void> {
    const environment = apiEnvironments.get(environmentId);
    if (!environment) {
      throw new NotFoundException('Environment not found');
    }
    if (environment.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    apiEnvironments.delete(environmentId);
  }

  async createApiKey(userId: string, createApiKeyDto: any): Promise<any> {
    const { name, permissions, expiresAt } = createApiKeyDto;

    const apiKey = {
      id: uuidv4(),
      userId,
      name,
      key: this.generateApiKey(),
      permissions: permissions || ['read'],
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: true,
      createdAt: new Date(),
      lastUsedAt: null
    };

    apiKeys.set(apiKey.id, apiKey);
    return apiKey;
  }

  async getUserApiKeys(userId: string): Promise<any[]> {
    return Array.from(apiKeys.values())
      .filter(key => key.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async revokeApiKey(userId: string, apiKeyId: string): Promise<void> {
    const apiKey = apiKeys.get(apiKeyId);
    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }
    if (apiKey.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    apiKey.isActive = false;
    apiKey.updatedAt = new Date();
  }

  async testRequest(userId: string, testRequestDto: any): Promise<any> {
    const { method, url, headers, body, environmentId, timeout } = testRequestDto;

    // Get environment variables
    let baseUrl = '';
    let variables = {};
    if (environmentId) {
      const environment = apiEnvironments.get(environmentId);
      if (environment && environment.userId === userId) {
        baseUrl = environment.baseUrl;
        variables = environment.variables;
      }
    }

    // Replace variables in URL and headers
    const finalUrl = this.replaceVariables(url, variables);
    const finalHeaders = this.replaceVariablesInObject(headers, variables);

    // Simulate API request (in real app, use axios or fetch)
    const startTime = Date.now();
    const response = await this.makeHttpRequest(method, finalUrl, finalHeaders, body, timeout);
    const endTime = Date.now();

    const requestResult = {
      id: uuidv4(),
      userId,
      method,
      url: finalUrl,
      headers: finalHeaders,
      body,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      },
      timing: {
        startTime,
        endTime,
        duration: endTime - startTime
      },
      environmentId,
      createdAt: new Date()
    };

    // Store in history
    requestHistory.set(requestResult.id, requestResult);
    return requestResult;
  }

  async getRequestHistory(userId: string, paginationDto: any): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto;
    
    const userRequests = Array.from(requestHistory.values())
      .filter(req => req.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRequests = userRequests.slice(startIndex, endIndex);

    return {
      requests: paginatedRequests,
      pagination: {
        page,
        limit,
        total: userRequests.length,
        totalPages: Math.ceil(userRequests.length / limit)
      }
    };
  }

  async getRequestDetails(userId: string, requestId: string): Promise<any> {
    const request = requestHistory.get(requestId);
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    if (request.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    return request;
  }

  async deleteRequestHistory(userId: string, requestId: string): Promise<void> {
    const request = requestHistory.get(requestId);
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    if (request.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    requestHistory.delete(requestId);
  }

  async clearAllHistory(userId: string): Promise<void> {
    const userRequests = Array.from(requestHistory.values())
      .filter(req => req.userId === userId);
    
    userRequests.forEach(req => {
      requestHistory.delete(req.id);
    });
  }

  private generateApiKey(): string {
    return 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private replaceVariables(text: string, variables: any): string {
    let result = text;
    Object.keys(variables).forEach(key => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
    });
    return result;
  }

  private replaceVariablesInObject(obj: any, variables: any): any {
    if (!obj) return obj;
    const result = {};
    Object.keys(obj).forEach(key => {
      result[key] = this.replaceVariables(obj[key], variables);
    });
    return result;
  }

  private async makeHttpRequest(method: string, url: string, headers: any, body: any, timeout: number = 5000): Promise<any> {
    // Simulate HTTP request (replace with actual implementation)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          data: { message: 'Mock response', timestamp: new Date().toISOString() }
        });
      }, Math.random() * 1000); // Random delay to simulate network
    });
  }
} 