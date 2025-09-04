import { Injectable } from '@nestjs/common';
import { MLPatternRecognizerService } from './ml-pattern-recognizer.service';
import { AdvancedSchemaGeneratorService } from './advanced-schema-generator.service';
import { BusinessLogicExtractorService } from './business-logic-extractor.service';
import { SecurityGeneratorService } from './security-generator.service';

@Injectable()
export class EnhancedDocumentationService {
  
  constructor(
    private mlRecognizer: MLPatternRecognizerService,
    private schemaGenerator: AdvancedSchemaGeneratorService,
    private businessLogicExtractor: BusinessLogicExtractorService,
    private securityGenerator: SecurityGeneratorService
  ) {}

  async generateEnhancedDocumentation(figmaData: any, projectId: string): Promise<any> {
    // Step 1: ML Pattern Recognition
    const patterns = await this.mlRecognizer.recognizePatterns(figmaData);
    
    // Step 2: Advanced Schema Generation
    const schemas = await this.schemaGenerator.generateAdvancedSchemas(figmaData, patterns);
    
    // Step 3: Business Logic Extraction
    const businessLogic = await this.businessLogicExtractor.extractBusinessLogic(figmaData, projectId);
    
    // Step 4: Security Pattern Generation
    const securityPatterns = await this.securityGenerator.generateSecurityPatterns(figmaData);
    
    // Step 5: Combine all results
    const enhancedDoc = this.combineResults(patterns, schemas, businessLogic, securityPatterns);
    
    return enhancedDoc;
  }

  async generateDocumentationWithProgress(figmaData: any, docJob: any): Promise<any> {
    try {
      // Step 1: ML Pattern Recognition (20%)
      docJob.progress = 20;
      docJob.status = 'recognizing_patterns';
      const recognizedPatterns = await this.mlRecognizer.recognizePatterns(figmaData);
      
      // Step 2: Business Logic Extraction (40%)
      docJob.progress = 40;
      docJob.status = 'extracting_business_logic';
      const businessLogic = await this.businessLogicExtractor.extractBusinessLogic(figmaData, docJob.projectId);
      
      // Step 3: Advanced Schema Generation (60%)
      docJob.progress = 60;
      docJob.status = 'generating_schemas';
      const advancedSchemas = await this.schemaGenerator.generateAdvancedSchemas(figmaData, recognizedPatterns);
      
      // Step 4: Security Generation (80%)
      docJob.progress = 80;
      docJob.status = 'generating_security';
      const securityPatterns = await this.securityGenerator.generateSecurityPatterns(figmaData);
      
      // Step 5: Endpoint Generation (90%)
      docJob.progress = 90;
      docJob.status = 'generating_endpoints';
      const endpoints = this.generateEndpoints(recognizedPatterns, businessLogic);
      
      // Step 6: Final Documentation (100%)
      docJob.progress = 100;
      docJob.status = 'completed';
      
      return {
        patterns: recognizedPatterns,
        businessLogic,
        schemas: advancedSchemas,
        securityPatterns,
        endpoints,
        apiSpecification: this.generateAPISpecification(recognizedPatterns, advancedSchemas, businessLogic, securityPatterns),
        documentation: this.generateDocumentation(recognizedPatterns, advancedSchemas, businessLogic, securityPatterns),
        codeExamples: this.generateCodeExamples(recognizedPatterns, advancedSchemas, businessLogic, securityPatterns)
      };
    } catch (error) {
      docJob.status = 'failed';
      docJob.error = error.message;
      throw error;
    }
  }

  private combineResults(patterns: any[], schemas: any[], businessLogic: any, securityPatterns: any[]): any {
    return {
      patterns,
      schemas,
      businessLogic,
      securityPatterns,
      apiSpecification: this.generateAPISpecification(patterns, schemas, businessLogic, securityPatterns),
      documentation: this.generateDocumentation(patterns, schemas, businessLogic, securityPatterns),
      codeExamples: this.generateCodeExamples(patterns, schemas, businessLogic, securityPatterns)
    };
  }

  private generateEndpoints(patterns: any[], businessLogic: any): any[] {
    const endpoints = [];
    
    for (const pattern of patterns) {
      for (const endpoint of pattern.suggestedEndpoints || []) {
        endpoints.push({
          path: endpoint.path,
          method: endpoint.method,
          operation: endpoint.operation,
          description: `${endpoint.operation} operation`,
          tags: [pattern.type],
          security: this.getSecurityForPattern(pattern),
          requestBody: this.generateRequestBody(endpoint),
          responses: this.generateResponses(endpoint)
        });
      }
    }
    
    return endpoints;
  }

  private generateAPISpecification(patterns: any[], schemas: any[], businessLogic: any, securityPatterns: any[]): any {
    return {
      openapi: '3.0.0',
      info: {
        title: 'Generated API',
        version: '1.0.0',
        description: 'API generated from Figma design'
      },
      servers: [
        { url: 'https://api.example.com/v1' }
      ],
      paths: this.generatePaths(patterns, businessLogic),
      components: {
        schemas: this.generateComponentSchemas(schemas),
        securitySchemes: this.generateSecuritySchemes(securityPatterns)
      }
    };
  }

  private generatePaths(patterns: any[], businessLogic: any): any {
    const paths = {};
    
    for (const pattern of patterns) {
      for (const endpoint of pattern.suggestedEndpoints || []) {
        const path = endpoint.path;
        const method = endpoint.method.toLowerCase();
        
        if (!paths[path]) {
          paths[path] = {};
        }
        
        paths[path][method] = {
          summary: `${endpoint.operation} operation`,
          tags: [pattern.type],
          security: this.getSecurityForPattern(pattern),
          requestBody: this.generateRequestBody(endpoint),
          responses: this.generateResponses(endpoint)
        };
      }
    }
    
    return paths;
  }

  private generateComponentSchemas(schemas: any[]): any {
    const componentSchemas = {};
    
    for (const schema of schemas) {
      componentSchemas[schema.name] = {
        type: schema.type,
        properties: schema.properties,
        required: schema.required || []
      };
    }
    
    return componentSchemas;
  }

  private generateSecuritySchemes(securityPatterns: any[]): any {
    const securitySchemes = {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    };
    
    return securitySchemes;
  }

  private generateDocumentation(patterns: any[], schemas: any[], businessLogic: any, securityPatterns: any[]): any {
    return {
      overview: this.generateOverview(patterns),
      endpoints: this.generateEndpointDocs(patterns, businessLogic),
      schemas: this.generateSchemaDocs(schemas),
      security: this.generateSecurityDocs(securityPatterns),
      examples: this.generateExampleDocs(patterns, schemas)
    };
  }

  private generateCodeExamples(patterns: any[], schemas: any[], businessLogic: any, securityPatterns: any[]): any {
    return {
      javascript: this.generateJavaScriptExamples(patterns, schemas),
      python: this.generatePythonExamples(patterns, schemas),
      curl: this.generateCurlExamples(patterns, schemas)
    };
  }

  // Helper methods for generating documentation components
  private generateOverview(patterns: any[]): string {
    return `This API was generated from Figma design patterns. It includes ${patterns.length} identified patterns with automated endpoint generation.`;
  }

  private generateEndpointDocs(patterns: any[], businessLogic: any): any[] {
    const docs = [];
    
    for (const pattern of patterns) {
      for (const endpoint of pattern.suggestedEndpoints || []) {
        docs.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          description: `${endpoint.operation} operation`,
          parameters: this.generateParameters(endpoint),
          requestBody: this.generateRequestBody(endpoint),
          responses: this.generateResponses(endpoint)
        });
      }
    }
    
    return docs;
  }

  private generateSchemaDocs(schemas: any[]): any[] {
    return schemas.map(schema => ({
      name: schema.name,
      description: `Schema for ${schema.name}`,
      properties: schema.properties,
      examples: this.generateSchemaExamples(schema)
    }));
  }

  private generateSecurityDocs(securityPatterns: any[]): any {
    return {
      authentication: this.generateAuthDocs(securityPatterns),
      authorization: this.generateAuthzDocs(securityPatterns),
      dataProtection: this.generateDataProtectionDocs(securityPatterns)
    };
  }

  private generateExampleDocs(patterns: any[], schemas: any[]): any[] {
    const examples = [];
    
    for (const pattern of patterns) {
      for (const endpoint of pattern.suggestedEndpoints || []) {
        examples.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          example: this.generateRequestExample(endpoint, schemas)
        });
      }
    }
    
    return examples;
  }

  // Code example generation methods
  private generateJavaScriptExamples(patterns: any[], schemas: any[]): any[] {
    const examples = [];
    
    for (const pattern of patterns) {
      for (const endpoint of pattern.suggestedEndpoints || []) {
        examples.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          code: this.generateJavaScriptCode(endpoint, schemas)
        });
      }
    }
    
    return examples;
  }

  private generatePythonExamples(patterns: any[], schemas: any[]): any[] {
    const examples = [];
    
    for (const pattern of patterns) {
      for (const endpoint of pattern.suggestedEndpoints || []) {
        examples.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          code: this.generatePythonCode(endpoint, schemas)
        });
      }
    }
    
    return examples;
  }

  private generateCurlExamples(patterns: any[], schemas: any[]): any[] {
    const examples = [];
    
    for (const pattern of patterns) {
      for (const endpoint of pattern.suggestedEndpoints || []) {
        examples.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          code: this.generateCurlCode(endpoint, schemas)
        });
      }
    }
    
    return examples;
  }

  // Helper methods for generating specific components
  private getSecurityForPattern(pattern: any): any[] {
    if (pattern.type === 'AUTHENTICATION') {
      return [{ bearerAuth: [] }];
    }
    return [];
  }

  private generateRequestBody(endpoint: any): any {
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      return {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: `#/components/schemas/${endpoint.operation.toLowerCase()}Request`
            }
          }
        }
      };
    }
    return undefined;
  }

  private generateResponses(endpoint: any): any {
    return {
      '200': {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: {
              $ref: `#/components/schemas/${endpoint.operation.toLowerCase()}Response`
            }
          }
        }
      },
      '400': {
        description: 'Bad request'
      },
      '401': {
        description: 'Unauthorized'
      },
      '404': {
        description: 'Not found'
      }
    };
  }

  private generateParameters(endpoint: any): any[] {
    const parameters = [];
    
    if (endpoint.path.includes(':id')) {
      parameters.push({
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'string'
        }
      });
    }
    
    return parameters;
  }

  private generateSchemaExamples(schema: any): any[] {
    return [
      {
        name: 'Basic Example',
        value: this.generateExampleFromSchema(schema)
      }
    ];
  }

  private generateExampleFromSchema(schema: any): any {
    const example: any = {};
    
    for (const [key, config] of Object.entries(schema.properties)) {
      const configObj = config as any;
      const type = configObj.type || typeof configObj;
      example[key] = configObj.example || this.generateDefaultExample(type);
    }
    
    return example;
  }

  private generateDefaultExample(type: string): any {
    switch (type) {
      case 'string': return 'example_string';
      case 'number': return 123;
      case 'boolean': return true;
      case 'array': return [];
      case 'object': return {};
      default: return null;
    }
  }

  private generateRequestExample(endpoint: any, schemas: any[]): any {
    const schema = schemas.find(s => s.name.toLowerCase().includes(endpoint.operation.toLowerCase()));
    
    if (schema) {
      return this.generateExampleFromSchema(schema);
    }
    
    return {
      example: 'Request body example'
    };
  }

  private generateJavaScriptCode(endpoint: any, schemas: any[]): string {
    const method = endpoint.method.toLowerCase();
    const url = endpoint.path;
    
    return `
// JavaScript example for ${endpoint.operation}
const response = await fetch('${url}', {
  method: '${method}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: ${method === 'get' ? 'undefined' : 'JSON.stringify(requestBody)'}
});

const data = await response.json();
console.log(data);
    `.trim();
  }

  private generatePythonCode(endpoint: any, schemas: any[]): string {
    const method = endpoint.method.lower();
    const url = endpoint.path;
    
    return `
# Python example for ${endpoint.operation}
import requests

url = '${url}'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
}

response = requests.${method}(url, headers=headers${method !== 'get' ? ', json=request_body' : ''})
data = response.json()
print(data)
    `.trim();
  }

  private generateCurlCode(endpoint: any, schemas: any[]): string {
    const method = endpoint.method;
    const url = endpoint.path;
    
    return `
# cURL example for ${endpoint.operation}
curl -X ${method} '${url}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_TOKEN' \\
  ${method !== 'GET' ? '-d \'{"key": "value"}\'' : ''}
    `.trim();
  }

  private generateAuthDocs(securityPatterns: any[]): any[] {
    const authDocs = [];
    
    for (const pattern of securityPatterns) {
      if (pattern.type === 'AUTHENTICATION') {
        authDocs.push({
          method: 'JWT Token',
          description: 'Bearer token authentication',
          implementation: pattern.suggestedSecurity
        });
      }
    }
    
    return authDocs;
  }

  private generateAuthzDocs(securityPatterns: any[]): any[] {
    const authzDocs = [];
    
    for (const pattern of securityPatterns) {
      if (pattern.type === 'AUTHORIZATION') {
        authzDocs.push({
          method: 'Role-based Access Control',
          description: 'Role-based authorization',
          implementation: pattern.suggestedSecurity
        });
      }
    }
    
    return authzDocs;
  }

  private generateDataProtectionDocs(securityPatterns: any[]): any[] {
    const protectionDocs = [];
    
    for (const pattern of securityPatterns) {
      if (pattern.type === 'DATA_PROTECTION') {
        protectionDocs.push({
          method: 'Data Encryption',
          description: 'Sensitive data protection',
          implementation: pattern.suggestedSecurity
        });
      }
    }
    
    return protectionDocs;
  }
} 