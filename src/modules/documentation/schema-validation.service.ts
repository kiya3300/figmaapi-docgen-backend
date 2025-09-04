import { Injectable } from '@nestjs/common';

interface ValidationRule {
  type: string;
  rule: any;
  message: string;
  code: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

interface OptimizedSchema {
  properties: Record<string, any>;
  required: string[];
  type: string;
  additionalProperties: boolean;
}

@Injectable()
export class SchemaValidationService {
  private customValidators: Map<string, any> = new Map();

  constructor() {
    this.initializeValidators();
  }

  private initializeValidators(): void {
    // Initialize custom validators
    this.customValidators.set('email', this.createEmailValidator());
    this.customValidators.set('phone', this.createPhoneValidator());
    this.customValidators.set('creditCard', this.createCreditCardValidator());
    this.customValidators.set('date', this.createDateValidator());
    this.customValidators.set('url', this.createURLValidator());
  }

  async generateValidationRules(schema: any): Promise<ValidationRule[]> {
    const rules = [];

    // Type validation
    rules.push(this.createTypeValidator(schema));

    // Required field validation
    if (schema.required && schema.required.length > 0) {
      rules.push(this.createRequiredValidator(schema));
    }

    // String validation
    if (schema.type === 'string') {
      rules.push(...this.createStringValidators(schema));
    }

    // Number validation
    if (schema.type === 'number' || schema.type === 'integer') {
      rules.push(...this.createNumberValidators(schema));
    }

    // Array validation
    if (schema.type === 'array') {
      rules.push(...this.createArrayValidators(schema));
    }

    // Object validation
    if (schema.type === 'object') {
      rules.push(...this.createObjectValidators(schema));
    }

    // Custom format validation
    if (schema.format) {
      rules.push(this.createFormatValidator(schema));
    }

    // Range validation
    if (schema.minimum !== undefined || schema.maximum !== undefined) {
      rules.push(this.createRangeValidator(schema));
    }

    // Pattern validation
    if (schema.pattern) {
      rules.push(this.createPatternValidator(schema));
    }

    // Enum validation
    if (schema.enum) {
      rules.push(this.createEnumValidator(schema));
    }

    // Custom validators
    for (const [name, validator] of this.customValidators) {
      if (schema[name]) {
        rules.push(validator(schema));
      }
    }

    return rules.filter(rule => rule !== null);
  }

  private createTypeValidator(schema: any): ValidationRule {
    return {
      type: 'type',
      rule: { type: schema.type },
      message: `Field must be of type ${schema.type}`,
      code: 'INVALID_TYPE'
    };
  }

  private createRequiredValidator(schema: any): ValidationRule {
    return {
      type: 'required',
      rule: { required: schema.required },
      message: 'Required fields are missing',
      code: 'MISSING_REQUIRED_FIELDS'
    };
  }

  private createStringValidators(schema: any): ValidationRule[] {
    const validators = [];

    if (schema.minLength !== undefined) {
      validators.push({
        type: 'minLength',
        rule: { minLength: schema.minLength },
        message: `String must be at least ${schema.minLength} characters long`,
        code: 'STRING_TOO_SHORT'
      });
    }

    if (schema.maxLength !== undefined) {
      validators.push({
        type: 'maxLength',
        rule: { maxLength: schema.maxLength },
        message: `String must not exceed ${schema.maxLength} characters`,
        code: 'STRING_TOO_LONG'
      });
    }

    return validators;
  }

  private createNumberValidators(schema: any): ValidationRule[] {
    const validators = [];

    if (schema.minimum !== undefined) {
      validators.push({
        type: 'minimum',
        rule: { minimum: schema.minimum },
        message: `Number must be at least ${schema.minimum}`,
        code: 'NUMBER_TOO_SMALL'
      });
    }

    if (schema.maximum !== undefined) {
      validators.push({
        type: 'maximum',
        rule: { maximum: schema.maximum },
        message: `Number must not exceed ${schema.maximum}`,
        code: 'NUMBER_TOO_LARGE'
      });
    }

    return validators;
  }

  private createArrayValidators(schema: any): ValidationRule[] {
    const validators = [];

    if (schema.minItems !== undefined) {
      validators.push({
        type: 'minItems',
        rule: { minItems: schema.minItems },
        message: `Array must have at least ${schema.minItems} items`,
        code: 'ARRAY_TOO_SHORT'
      });
    }

    if (schema.maxItems !== undefined) {
      validators.push({
        type: 'maxItems',
        rule: { maxItems: schema.maxItems },
        message: `Array must not exceed ${schema.maxItems} items`,
        code: 'ARRAY_TOO_LONG'
      });
    }

    return validators;
  }

  private createObjectValidators(schema: any): ValidationRule[] {
    const validators = [];

    if (schema.minProperties !== undefined) {
      validators.push({
        type: 'minProperties',
        rule: { minProperties: schema.minProperties },
        message: `Object must have at least ${schema.minProperties} properties`,
        code: 'OBJECT_TOO_FEW_PROPERTIES'
      });
    }

    if (schema.maxProperties !== undefined) {
      validators.push({
        type: 'maxProperties',
        rule: { maxProperties: schema.maxProperties },
        message: `Object must not exceed ${schema.maxProperties} properties`,
        code: 'OBJECT_TOO_MANY_PROPERTIES'
      });
    }

    return validators;
  }

  private createFormatValidator(schema: any): ValidationRule {
    const formatRules = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^\+?[\d\s\-\(\)]+$/,
      creditCard: /^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/,
      date: /^\d{4}-\d{2}-\d{2}$/,
      url: /^https?:\/\/.+/,
      uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    };

    const rule = formatRules[schema.format as keyof typeof formatRules];
    
    if (rule) {
      return {
        type: 'format',
        rule: { pattern: rule },
        message: `Field must be a valid ${schema.format}`,
        code: `INVALID_${schema.format.toUpperCase()}`
      };
    }

    return null;
  }

  private createRangeValidator(schema: any): ValidationRule {
    return {
      type: 'range',
      rule: {
        minimum: schema.minimum,
        maximum: schema.maximum,
        exclusiveMinimum: schema.exclusiveMinimum,
        exclusiveMaximum: schema.exclusiveMaximum
      },
      message: `Number must be between ${schema.minimum} and ${schema.maximum}`,
      code: 'NUMBER_OUT_OF_RANGE'
    };
  }

  private createPatternValidator(schema: any): ValidationRule {
    return {
      type: 'pattern',
      rule: { pattern: new RegExp(schema.pattern) },
      message: `Field must match pattern ${schema.pattern}`,
      code: 'PATTERN_MISMATCH'
    };
  }

  private createEnumValidator(schema: any): ValidationRule {
    return {
      type: 'enum',
      rule: { enum: schema.enum },
      message: `Field must be one of: ${schema.enum.join(', ')}`,
      code: 'INVALID_ENUM_VALUE'
    };
  }

  private createEmailValidator(): (schema: any) => ValidationRule {
    return (schema: any) => ({
      type: 'email',
      rule: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      message: 'Field must be a valid email address',
      code: 'INVALID_EMAIL'
    });
  }

  private createPhoneValidator(): (schema: any) => ValidationRule {
    return (schema: any) => ({
      type: 'phone',
      rule: { pattern: /^\+?[\d\s\-\(\)]+$/ },
      message: 'Field must be a valid phone number',
      code: 'INVALID_PHONE'
    });
  }

  private createCreditCardValidator(): (schema: any) => ValidationRule {
    return (schema: any) => ({
      type: 'creditCard',
      rule: { pattern: /^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/ },
      message: 'Field must be a valid credit card number',
      code: 'INVALID_CREDIT_CARD'
    });
  }

  private createDateValidator(): (schema: any) => ValidationRule {
    return (schema: any) => ({
      type: 'date',
      rule: { pattern: /^\d{4}-\d{2}-\d{2}$/ },
      message: 'Field must be a valid date (YYYY-MM-DD)',
      code: 'INVALID_DATE'
    });
  }

  private createURLValidator(): (schema: any) => ValidationRule {
    return (schema: any) => ({
      type: 'url',
      rule: { pattern: /^https?:\/\/.+/ },
      message: 'Field must be a valid URL',
      code: 'INVALID_URL'
    });
  }

  async validateData(data: any, schema: any): Promise<ValidationResult> {
    const rules = await this.generateValidationRules(schema);
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    for (const rule of rules) {
      const result = this.applyValidationRule(data, rule);
      if (!result.isValid) {
        errors.push(result.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private applyValidationRule(data: any, rule: ValidationRule): { isValid: boolean; message: string } {
    // Simplified validation logic
    switch (rule.type) {
      case 'type':
        return {
          isValid: typeof data === rule.rule.type,
          message: rule.message
        };
      case 'required':
        return {
          isValid: data !== undefined && data !== null,
          message: rule.message
        };
      case 'minLength':
        return {
          isValid: data.length >= rule.rule.minLength,
          message: rule.message
        };
      case 'maxLength':
        return {
          isValid: data.length <= rule.rule.maxLength,
          message: rule.message
        };
      case 'minimum':
        return {
          isValid: data >= rule.rule.minimum,
          message: rule.message
        };
      case 'maximum':
        return {
          isValid: data <= rule.rule.maximum,
          message: rule.message
        };
      case 'pattern':
        return {
          isValid: rule.rule.pattern.test(data),
          message: rule.message
        };
      case 'enum':
        return {
          isValid: rule.rule.enum.includes(data),
          message: rule.message
        };
      default:
        return {
          isValid: true,
          message: ''
        };
    }
  }

  async optimizeSchema(schema: any): Promise<OptimizedSchema> {
    const optimized = {
      properties: {},
      required: [],
      type: schema.type,
      additionalProperties: schema.additionalProperties || false
    };

    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        const propObj = prop as any;
        const optimizedProp = { ...propObj };
        
        // Optimize nested schemas
        if (propObj.type === 'object' && propObj.properties) {
          optimizedProp.properties = this.optimizeNestedSchemas(propObj.properties);
        } else if (propObj.type === 'array' && propObj.items) {
          optimizedProp.items = this.optimizeNestedSchemas(propObj.items);
        }
        
        optimized.properties[key] = optimizedProp;
      }
    }

    if (schema.required) {
      optimized.required = schema.required;
    }

    return optimized;
  }

  private optimizeNestedSchemas(schema: any): any {
    if (typeof schema === 'object' && schema !== null) {
      const optimized = { ...schema };
      
      for (const [key, prop] of Object.entries(optimized)) {
        const propObj = prop as any;
        if (propObj.type === 'object') {
          optimized[key] = this.optimizeNestedSchemas(propObj);
        } else if (propObj.type === 'array') {
          optimized[key] = this.optimizeNestedSchemas(propObj.items);
        }
      }
      
      return optimized;
    }
    
    return schema;
  }

  async calculateSchemaComplexity(schema: any): Promise<number> {
    let complexity = 1;
    
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        const propObj = prop as any;
        complexity += 1;
        
        if (propObj.type === 'object') {
          complexity += this.calculateComplexity(propObj) * 2;
        } else if (propObj.type === 'array') {
          complexity += this.calculateComplexity(propObj.items) * 2;
        }
      }
    }
    
    return complexity;
  }

  private calculateComplexity(schema: any): number {
    if (!schema || typeof schema !== 'object') {
      return 1;
    }
    
    let complexity = 1;
    
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        const propObj = prop as any;
        complexity += 1;
        
        if (propObj.type === 'object') {
          complexity += this.calculateComplexity(propObj) * 2;
        } else if (propObj.type === 'array') {
          complexity += this.calculateComplexity(propObj.items) * 2;
        }
      }
    }
    
    return complexity;
  }
} 