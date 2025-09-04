import { Injectable } from '@nestjs/common';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  statusCode: number;
  headers: boolean;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'fifo';
  compression: boolean;
  headers: {
    'Cache-Control': string;
    'ETag': boolean;
    'Last-Modified': boolean;
  };
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

interface APIVersion {
  version: string;
  status: 'current' | 'deprecated' | 'sunset';
  sunsetDate?: string;
  migrationGuide?: string;
  breakingChanges: string[];
}

interface EndpointExample {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  response?: any;
}

@Injectable()
export class ProductionFeaturesService {
  private rateLimitConfigs: Map<string, RateLimitConfig> = new Map();
  private cacheConfigs: Map<string, CacheConfig> = new Map();
  private apiVersions: Map<string, APIVersion[]> = new Map();
  private errorTemplates: Map<string, ErrorResponse> = new Map();

  constructor() {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs(): void {
    // Default rate limiting
    this.rateLimitConfigs.set('default', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: 'Too many requests from this IP',
      statusCode: 429,
      headers: true,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    });

    // Default caching
    this.cacheConfigs.set('default', {
      ttl: 3600,
      maxSize: 104857600,
      strategy: 'lru',
      compression: true,
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'ETag': true,
        'Last-Modified': true
      }
    });

    // Default error templates
    this.errorTemplates.set('400', {
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid request data',
        timestamp: new Date().toISOString(),
        requestId: ''
      }
    });
  }

  async generateRateLimiting(patterns: any[]): Promise<RateLimitConfig[]> {
    const rateLimitConfigs = [];

    for (const pattern of patterns) {
      const config = this.createRateLimitConfig(pattern);
      rateLimitConfigs.push(config);
    }

    return rateLimitConfigs;
  }

  private createRateLimitConfig(pattern: any): RateLimitConfig {
    const baseConfig = this.rateLimitConfigs.get('default')!;
    
    switch (pattern.type) {
      case 'auth':
        return {
          ...baseConfig,
          windowMs: 5 * 60 * 1000, // 5 minutes
          max: 5, // 5 attempts
          message: 'Too many authentication attempts'
        };
      case 'file':
        return {
          ...baseConfig,
          windowMs: 60 * 1000, // 1 minute
          max: 10, // 10 file operations
          message: 'Too many file operations'
        };
      case 'analytics':
        return {
          ...baseConfig,
          windowMs: 60 * 1000, // 1 minute
          max: 50, // 50 analytics requests
          message: 'Too many analytics requests'
        };
      default:
        return baseConfig;
    }
  }

  async generateCachingStrategies(schemas: any[]): Promise<CacheConfig[]> {
    const cacheConfigs = [];

    for (const schema of schemas) {
      const config = this.createCacheConfig(schema);
      cacheConfigs.push(config);
    }

    return cacheConfigs;
  }

  private createCacheConfig(schema: any): CacheConfig {
    const baseConfig = this.cacheConfigs.get('default')!;
    
    // Adjust TTL based on schema type
    let ttl = baseConfig.ttl;
    if (schema.type === 'user') {
      ttl = 1800; // 30 minutes
    } else if (schema.type === 'project') {
      ttl = 7200; // 2 hours
    } else if (schema.type === 'analytics') {
      ttl = 300; // 5 minutes
    }
    
    return {
      ...baseConfig,
      ttl,
      headers: {
        ...baseConfig.headers,
        'Cache-Control': `public, max-age=${ttl}`
      }
    };
  }

  async generateErrorHandling(patterns: any[]): Promise<ErrorResponse[]> {
    const errorResponses = [];

    // Standard error responses
    errorResponses.push(this.createErrorResponse('400', 'Bad Request'));
    errorResponses.push(this.createErrorResponse('401', 'Unauthorized'));
    errorResponses.push(this.createErrorResponse('403', 'Forbidden'));
    errorResponses.push(this.createErrorResponse('404', 'Not Found'));
    errorResponses.push(this.createErrorResponse('422', 'Validation Error'));
    errorResponses.push(this.createErrorResponse('429', 'Too Many Requests'));
    errorResponses.push(this.createErrorResponse('500', 'Internal Server Error'));

    // Pattern-specific error responses
    for (const pattern of patterns) {
      const patternErrors = this.createPatternSpecificErrors(pattern);
      errorResponses.push(...patternErrors);
    }

    return errorResponses;
  }

  private createErrorResponse(code: string, message: string): ErrorResponse {
    return {
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
        requestId: ''
      }
    };
  }

  private createPatternSpecificErrors(pattern: any): ErrorResponse[] {
    const errors = [];
    
    switch (pattern.type) {
      case 'auth':
        errors.push(this.createErrorResponse('AUTH_FAILED', 'Authentication failed'));
        errors.push(this.createErrorResponse('TOKEN_EXPIRED', 'Access token expired'));
        errors.push(this.createErrorResponse('INVALID_CREDENTIALS', 'Invalid credentials'));
        break;
      case 'file':
        errors.push(this.createErrorResponse('FILE_NOT_FOUND', 'File not found'));
        errors.push(this.createErrorResponse('FILE_TOO_LARGE', 'File size exceeds limit'));
        errors.push(this.createErrorResponse('INVALID_FILE_TYPE', 'Invalid file type'));
        break;
      case 'payment':
        errors.push(this.createErrorResponse('PAYMENT_FAILED', 'Payment processing failed'));
        errors.push(this.createErrorResponse('INSUFFICIENT_FUNDS', 'Insufficient funds'));
        errors.push(this.createErrorResponse('CARD_DECLINED', 'Card declined'));
        break;
    }
    
    return errors;
  }

  async generateAPIVersioning(schemas: any[]): Promise<APIVersion[]> {
    const versions = [];

    // Create version 1.0.0
    versions.push({
      version: '1.0.0',
      status: 'current',
      breakingChanges: []
    });

    // Create version 2.0.0 with breaking changes
    versions.push({
      version: '2.0.0',
      status: 'deprecated',
      sunsetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      migrationGuide: '/docs/migration/v2.0.0',
      breakingChanges: [
        'Removed deprecated fields',
        'Changed response format',
        'Updated authentication method'
      ]
    });

    return versions;
  }

  async generateEndpointExamples(endpoints: any[]): Promise<EndpointExample[]> {
    const examples = [];

    for (const endpoint of endpoints) {
      const example: EndpointExample = {
        method: endpoint.method,
        url: endpoint.url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_TOKEN'
        }
      };

      if (endpoint.requestBody) {
        example.body = this.generateRequestBodyExample(endpoint.requestBody);
      }

      if (endpoint.response) {
        example.response = this.generateResponseExample(endpoint.response);
      }

      examples.push(example);
    }

    return examples;
  }

  private generateRequestBodyExample(schema: any): any {
    const example = {};
    
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        example[key] = this.generatePropertyExample(prop as any);
      }
    }
    
    return example;
  }

  private generateResponseExample(schema: any): any {
    return this.generateRequestBodyExample(schema);
  }

  private generatePropertyExample(prop: any): any {
    if (prop.example) {
      return prop.example;
    }
    
    switch (prop.type) {
      case 'string':
        return prop.enum ? prop.enum[0] : 'example_string';
      case 'number':
        return prop.minimum || 0;
      case 'boolean':
        return false;
      case 'array':
        return [this.generatePropertyExample(prop.items)];
      case 'object':
        return this.generateRequestBodyExample(prop);
      default:
        return null;
    }
  }

  async generateSecuritySchemes(patterns: any[]): Promise<any[]> {
    const schemes = [];

    // Basic authentication
    schemes.push({
      type: 'http',
      scheme: 'basic',
      description: 'Basic authentication with username and password'
    });

    // Bearer token
    schemes.push({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT token authentication'
    });

    // API Key
    schemes.push({
      type: 'apiKey',
      in: 'header',
      name: 'X-API-Key',
      description: 'API key authentication'
    });

    // OAuth2
    schemes.push({
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: 'https://example.com/oauth/authorize',
          tokenUrl: 'https://example.com/oauth/token',
          scopes: {
            read: 'Read access',
            write: 'Write access'
          }
        }
      }
    });

    return schemes;
  }

  async generateRateLimitHeaders(): Promise<Record<string, string>> {
    return {
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '99',
      'X-RateLimit-Reset': new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      'Retry-After': '60'
    };
  }

  async generateCacheHeaders(ttl: number): Promise<Record<string, string>> {
    return {
      'Cache-Control': `public, max-age=${ttl}`,
      'ETag': `"${Date.now()}"`,
      'Last-Modified': new Date().toUTCString()
    };
  }
} 