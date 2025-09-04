import { Injectable } from '@nestjs/common';
import { MLPatternRecognizerService } from './ml-pattern-recognizer.service';

interface ComplexSchema {
  name: string;
  type: string;
  properties: any;
  required: string[];
  additionalProperties?: boolean;
  discriminator?: any;
  allOf?: any[];
  anyOf?: any[];
  oneOf?: any[];
  not?: any;
  dependencies?: any;
  patternProperties?: any;
  propertyNames?: any;
}

@Injectable()
export class AdvancedSchemaGeneratorService {
  
  constructor(private mlRecognizer: MLPatternRecognizerService) {}

  async generateAdvancedSchemas(figmaData: any, patterns: any[]): Promise<ComplexSchema[]> {
    const schemas = [];
    
    // Generate schemas from patterns
    for (const pattern of patterns) {
      const patternSchemas = this.generatePatternSchemas(pattern);
      schemas.push(...patternSchemas);
    }
    
    // Generate schemas from components
    const componentSchemas = this.generateComponentSchemas(figmaData);
    schemas.push(...componentSchemas);
    
    // Generate complex schemas
    const complexSchemas = this.generateComplexSchemas(figmaData, patterns);
    schemas.push(...complexSchemas);
    
    return schemas;
  }

  private generatePatternSchemas(pattern: any): ComplexSchema[] {
    const schemas = [];
    
    switch (pattern.type) {
      case 'CRUD':
        schemas.push(...this.generateCRUDSchemas(pattern));
        break;
      case 'AUTHENTICATION':
        schemas.push(...this.generateAuthSchemas(pattern));
        break;
      case 'SEARCH':
        schemas.push(...this.generateSearchSchemas(pattern));
        break;
      case 'WORKFLOW':
        schemas.push(...this.generateWorkflowSchemas(pattern));
        break;
    }
    
    return schemas;
  }

  private generateCRUDSchemas(pattern: any): ComplexSchema[] {
    const component = pattern.components[0];
    
    return [
      {
        name: `${component}Create`,
        type: 'object',
        properties: this.generateCRUDProperties(component, 'create'),
        required: this.generateCRUDRequired(component, 'create')
      },
      {
        name: `${component}Update`,
        type: 'object',
        properties: this.generateCRUDProperties(component, 'update'),
        required: this.generateCRUDRequired(component, 'update')
      },
      {
        name: `${component}Response`,
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          ...this.generateCRUDProperties(component, 'response')
        },
        required: ['id']
      }
    ];
  }

  private generateAuthSchemas(pattern: any): ComplexSchema[] {
    return [
      {
        name: 'LoginRequest',
        type: 'object',
        properties: {
          email: { 
            type: 'string', 
            format: 'email',
            description: 'User email address'
          },
          password: { 
            type: 'string', 
            minLength: 6,
            description: 'User password'
          }
        },
        required: ['email', 'password']
      },
      {
        name: 'RegisterRequest',
        type: 'object',
        properties: {
          email: { 
            type: 'string', 
            format: 'email',
            description: 'User email address'
          },
          password: { 
            type: 'string', 
            minLength: 6,
            description: 'User password'
          },
          name: { 
            type: 'string', 
            minLength: 2,
            description: 'User full name'
          }
        },
        required: ['email', 'password', 'name']
      },
      {
        name: 'AuthResponse',
        type: 'object',
        properties: {
          access_token: { 
            type: 'string',
            description: 'JWT access token'
          },
          refresh_token: { 
            type: 'string',
            description: 'JWT refresh token'
          },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' }
            }
          }
        },
        required: ['access_token', 'user']
      }
    ];
  }

  private generateSearchSchemas(pattern: any): ComplexSchema[] {
    return [
      {
        name: 'SearchRequest',
        type: 'object',
        properties: {
          query: { 
            type: 'string',
            description: 'Search query'
          },
          filters: {
            type: 'object',
            additionalProperties: true,
            description: 'Search filters'
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number', minimum: 1 },
              limit: { type: 'number', minimum: 1, maximum: 100 }
            }
          }
        },
        required: ['query']
      },
      {
        name: 'SearchResponse',
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: true
            }
          },
          total: { type: 'number' },
          page: { type: 'number' },
          limit: { type: 'number' },
          pages: { type: 'number' }
        },
        required: ['results', 'total']
      }
    ];
  }

  private generateWorkflowSchemas(pattern: any): ComplexSchema[] {
    return [
      {
        name: 'WorkflowStart',
        type: 'object',
        properties: {
          parameters: {
            type: 'object',
            additionalProperties: true,
            description: 'Workflow parameters'
          }
        },
        required: ['parameters']
      },
      {
        name: 'WorkflowProgress',
        type: 'object',
        properties: {
          step_data: {
            type: 'object',
            additionalProperties: true,
            description: 'Step data'
          }
        },
        required: ['step_data']
      },
      {
        name: 'WorkflowStatus',
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string', enum: ['running', 'completed', 'failed'] },
          current_step: { type: 'number' },
          total_steps: { type: 'number' },
          progress: { type: 'number', minimum: 0, maximum: 100 }
        },
        required: ['id', 'status', 'current_step', 'total_steps']
      }
    ];
  }

  private generateComponentSchemas(figmaData: any): ComplexSchema[] {
    const schemas = [];
    
    for (const component of figmaData.components || []) {
      const schema = {
        name: component.name,
        type: 'object',
        properties: this.extractComponentProperties(component),
        required: this.extractRequiredProperties(component)
      };
      schemas.push(schema);
    }
    
    return schemas;
  }

  private generateComplexSchemas(figmaData: any, patterns: any[]): ComplexSchema[] {
    const schemas = [];
    
    // Generate nested schemas
    const nestedSchemas = this.generateNestedSchemas(figmaData);
    schemas.push(...nestedSchemas);
    
    // Generate union schemas
    const unionSchemas = this.generateUnionSchemas(patterns);
    schemas.push(...unionSchemas);
    
    // Generate conditional schemas
    const conditionalSchemas = this.generateConditionalSchemas(figmaData);
    schemas.push(...conditionalSchemas);
    
    return schemas;
  }

  private generateCRUDProperties(component: any, operation: string): any {
    const properties = {};
    
    if (component.properties) {
      for (const [key, value] of Object.entries(component.properties)) {
        properties[key] = {
          type: typeof value,
          description: `Property ${key} for ${operation} operation`
        };
      }
    }
    
    return properties;
  }

  private generateCRUDRequired(component: any, operation: string): string[] {
    const required = [];
    
    if (component.properties) {
      for (const [key, value] of Object.entries(component.properties)) {
        if (value !== null && value !== undefined && value !== '') {
          required.push(key);
        }
      }
    }
    
    return required;
  }

  private extractComponentProperties(component: any): any {
    const properties = {};
    
    if (component.properties) {
      for (const [key, value] of Object.entries(component.properties)) {
        properties[key] = {
          type: typeof value,
          description: `Property ${key} from component ${component.name}`,
          example: value
        };
      }
    }
    
    return properties;
  }

  private extractRequiredProperties(component: any): string[] {
    const required = [];
    
    if (component.properties) {
      for (const [key, value] of Object.entries(component.properties)) {
        if (value !== null && value !== undefined && value !== '') {
          required.push(key);
        }
      }
    }
    
    return required;
  }

  private generateNestedSchemas(figmaData: any): ComplexSchema[] {
    const schemas = [];
    
    // Look for components with nested structures
    for (const component of figmaData.components || []) {
      if (component.children && component.children.length > 0) {
        const nestedSchema = {
          name: `${component.name}Nested`,
          type: 'object',
          properties: {
            ...this.extractComponentProperties(component),
            children: {
              type: 'array',
              items: {
                type: 'object',
                properties: this.extractComponentProperties(component.children[0])
              }
            }
          },
          required: this.extractRequiredProperties(component)
        };
        schemas.push(nestedSchema);
      }
    }
    
    return schemas;
  }

  private generateUnionSchemas(patterns: any[]): ComplexSchema[] {
    const schemas = [];
    
    // Generate union schemas for different pattern types
    const patternTypes = patterns.map(p => p.type);
    
    if (patternTypes.length > 1) {
      const unionSchema = {
        name: 'PatternUnion',
        type: 'object',
        oneOf: patternTypes.map(type => ({
          type: 'object',
          properties: {
            pattern_type: { type: 'string', enum: [type] },
            data: { type: 'object' }
          },
          required: ['pattern_type', 'data']
        }))
      };
      schemas.push(unionSchema);
    }
    
    return schemas;
  }

  private generateConditionalSchemas(figmaData: any): ComplexSchema[] {
    const schemas = [];
    
    // Generate conditional schemas based on component properties
    for (const component of figmaData.components || []) {
      if (component.properties && Object.keys(component.properties).length > 1) {
        const conditionalSchema = {
          name: `${component.name}Conditional`,
          type: 'object',
          properties: this.extractComponentProperties(component),
          required: this.extractRequiredProperties(component),
          dependencies: this.generateDependencies(component)
        };
        schemas.push(conditionalSchema);
      }
    }
    
    return schemas;
  }

  private generateDependencies(component: any): any {
    const dependencies = {};
    
    if (component.properties) {
      const propertyKeys = Object.keys(component.properties);
      
      for (const key of propertyKeys) {
        dependencies[key] = {
          required: propertyKeys.filter(k => k !== key)
        };
      }
    }
    
    return dependencies;
  }
} 