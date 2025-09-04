import { Injectable } from '@nestjs/common';
import { MLPatternRecognizerService } from './ml-pattern-recognizer.service';
import { AdvancedSchemaGeneratorService } from './advanced-schema-generator.service';

interface BusinessLogicPattern {
  type: string;
  confidence: number;
  components: string[];
  suggestedLogic: any[];
  dataFlow: any[];
  validationRules: any[];
}

interface ExtractedLogic {
  patterns: BusinessLogicPattern[];
  dataModels: any[];
  businessRules: any[];
  workflows: any[];
  validations: any[];
}

@Injectable()
export class BusinessLogicExtractorService {
  
  constructor(
    private mlRecognizer: MLPatternRecognizerService,
    private schemaGenerator: AdvancedSchemaGeneratorService
  ) {}

  async extractBusinessLogic(figmaData: any, projectId: string): Promise<ExtractedLogic> {
    // Step 1: Analyze component relationships
    const componentRelationships = await this.analyzeComponentRelationships(figmaData);
    
    // Step 2: Extract data flow patterns
    const dataFlowPatterns = await this.extractDataFlowPatterns(figmaData, componentRelationships);
    
    // Step 3: Identify business rules
    const businessRules = await this.identifyBusinessRules(figmaData, dataFlowPatterns);
    
    // Step 4: Generate data models
    const dataModels = await this.generateDataModels(figmaData, businessRules);
    
    // Step 5: Create validation rules
    const validations = await this.createValidationRules(dataModels, businessRules);
    
    // Step 6: Generate workflows
    const workflows = await this.generateWorkflows(dataFlowPatterns, businessRules);

    return {
      patterns: dataFlowPatterns,
      dataModels,
      businessRules,
      workflows,
      validations
    };
  }

  private async analyzeComponentRelationships(figmaData: any): Promise<any[]> {
    const relationships = [];
    
    // Analyze parent-child relationships
    for (const component of figmaData.components || []) {
      const children = this.findChildComponents(component, figmaData);
      const parents = this.findParentComponents(component, figmaData);
      
      relationships.push({
        componentId: component.id,
        children: children.map(c => c.id),
        parents: parents.map(c => c.id),
        hierarchy: this.calculateHierarchyLevel(component, figmaData)
      });
    }
    
    return relationships;
  }

  private async extractDataFlowPatterns(figmaData: any, relationships: any[]): Promise<BusinessLogicPattern[]> {
    const patterns = [];
    
    // Identify CRUD patterns
    const crudPatterns = this.identifyCRUDPatterns(figmaData);
    patterns.push(...crudPatterns);
    
    // Identify search patterns
    const searchPatterns = this.identifySearchPatterns(figmaData);
    patterns.push(...searchPatterns);
    
    // Identify authentication patterns
    const authPatterns = this.identifyAuthPatterns(figmaData);
    patterns.push(...authPatterns);
    
    // Identify workflow patterns
    const workflowPatterns = this.identifyWorkflowPatterns(figmaData, relationships);
    patterns.push(...workflowPatterns);
    
    return patterns;
  }

  private async identifyBusinessRules(figmaData: any, dataFlowPatterns: BusinessLogicPattern[]): Promise<any[]> {
    const rules = [];
    
    // Extract validation rules from component properties
    for (const component of figmaData.components || []) {
      const componentRules = this.extractComponentRules(component);
      rules.push(...componentRules);
    }
    
    // Extract business logic from data flow patterns
    for (const pattern of dataFlowPatterns) {
      const patternRules = this.extractPatternRules(pattern);
      rules.push(...patternRules);
    }
    
    return rules;
  }

  private async generateDataModels(figmaData: any, businessRules: any[]): Promise<any[]> {
    const models = [];
    
    // Generate models from components
    for (const component of figmaData.components || []) {
      const model = this.generateModelFromComponent(component, businessRules);
      if (model) {
        models.push(model);
      }
    }
    
    // Generate models from business rules
    for (const rule of businessRules) {
      const model = this.generateModelFromRule(rule);
      if (model) {
        models.push(model);
      }
    }
    
    return models;
  }

  private async createValidationRules(dataModels: any[], businessRules: any[]): Promise<any[]> {
    const validations = [];
    
    // Create validations from data models
    for (const model of dataModels) {
      const modelValidations = this.createModelValidations(model);
      validations.push(...modelValidations);
    }
    
    // Create validations from business rules
    for (const rule of businessRules) {
      const ruleValidations = this.createRuleValidations(rule);
      validations.push(...ruleValidations);
    }
    
    return validations;
  }

  private async generateWorkflows(dataFlowPatterns: BusinessLogicPattern[], businessRules: any[]): Promise<any[]> {
    const workflows = [];
    
    // Generate workflows from data flow patterns
    for (const pattern of dataFlowPatterns) {
      const workflow = this.generateWorkflowFromPattern(pattern, businessRules);
      if (workflow) {
        workflows.push(workflow);
      }
    }
    
    return workflows;
  }

  // Helper methods
  private findChildComponents(component: any, figmaData: any): any[] {
    return figmaData.components?.filter(c => c.parentId === component.id) || [];
  }

  private findParentComponents(component: any, figmaData: any): any[] {
    return figmaData.components?.filter(c => c.id === component.parentId) || [];
  }

  private calculateHierarchyLevel(component: any, figmaData: any): number {
    let level = 0;
    let current = component;
    
    while (current.parentId) {
      current = figmaData.components?.find(c => c.id === current.parentId);
      level++;
    }
    
    return level;
  }

  private identifyCRUDPatterns(figmaData: any): BusinessLogicPattern[] {
    const patterns = [];
    
    // Look for form components
    const forms = figmaData.components?.filter(c => 
      c.name.toLowerCase().includes('form') || 
      c.name.toLowerCase().includes('create') ||
      c.name.toLowerCase().includes('edit')
    ) || [];
    
    for (const form of forms) {
      patterns.push({
        type: 'CRUD',
        confidence: 0.85,
        components: [form.id],
        suggestedLogic: this.generateCRUDLogic(form),
        dataFlow: this.generateCRUDDataFlow(form),
        validationRules: this.generateCRUDValidations(form)
      });
    }
    
    return patterns;
  }

  private identifySearchPatterns(figmaData: any): BusinessLogicPattern[] {
    const patterns = [];
    
    // Look for search components
    const searchComponents = figmaData.components?.filter(c => 
      c.name.toLowerCase().includes('search') || 
      c.name.toLowerCase().includes('filter')
    ) || [];
    
    for (const search of searchComponents) {
      patterns.push({
        type: 'SEARCH',
        confidence: 0.80,
        components: [search.id],
        suggestedLogic: this.generateSearchLogic(search),
        dataFlow: this.generateSearchDataFlow(search),
        validationRules: this.generateSearchValidations(search)
      });
    }
    
    return patterns;
  }

  private identifyAuthPatterns(figmaData: any): BusinessLogicPattern[] {
    const patterns = [];
    
    // Look for authentication components
    const authComponents = figmaData.components?.filter(c => 
      c.name.toLowerCase().includes('login') || 
      c.name.toLowerCase().includes('signup') ||
      c.name.toLowerCase().includes('auth')
    ) || [];
    
    for (const auth of authComponents) {
      patterns.push({
        type: 'AUTHENTICATION',
        confidence: 0.90,
        components: [auth.id],
        suggestedLogic: this.generateAuthLogic(auth),
        dataFlow: this.generateAuthDataFlow(auth),
        validationRules: this.generateAuthValidations(auth)
      });
    }
    
    return patterns;
  }

  private identifyWorkflowPatterns(figmaData: any, relationships: any[]): BusinessLogicPattern[] {
    const patterns = [];
    
    // Look for workflow components
    const workflowComponents = figmaData.components?.filter(c => 
      c.name.toLowerCase().includes('workflow') || 
      c.name.toLowerCase().includes('process') ||
      c.name.toLowerCase().includes('flow')
    ) || [];
    
    for (const workflow of workflowComponents) {
      patterns.push({
        type: 'WORKFLOW',
        confidence: 0.75,
        components: [workflow.id],
        suggestedLogic: this.generateWorkflowLogic(workflow, relationships),
        dataFlow: this.generateWorkflowDataFlow(workflow, relationships),
        validationRules: this.generateWorkflowValidations(workflow)
      });
    }
    
    return patterns;
  }

  // Logic generation methods
  private generateCRUDLogic(form: any): any[] {
    return [
      {
        operation: 'CREATE',
        endpoint: `/api/${form.name.toLowerCase()}`,
        method: 'POST',
        validation: 'required_fields',
        response: 'created_entity'
      },
      {
        operation: 'READ',
        endpoint: `/api/${form.name.toLowerCase()}/:id`,
        method: 'GET',
        validation: 'id_exists',
        response: 'entity_data'
      },
      {
        operation: 'UPDATE',
        endpoint: `/api/${form.name.toLowerCase()}/:id`,
        method: 'PUT',
        validation: 'id_exists_and_required_fields',
        response: 'updated_entity'
      },
      {
        operation: 'DELETE',
        endpoint: `/api/${form.name.toLowerCase()}/:id`,
        method: 'DELETE',
        validation: 'id_exists',
        response: 'deletion_confirmation'
      }
    ];
  }

  private generateSearchLogic(search: any): any[] {
    return [
      {
        operation: 'SEARCH',
        endpoint: `/api/search`,
        method: 'GET',
        validation: 'search_query_required',
        response: 'search_results'
      },
      {
        operation: 'FILTER',
        endpoint: `/api/search/filter`,
        method: 'POST',
        validation: 'filter_criteria',
        response: 'filtered_results'
      }
    ];
  }

  private generateAuthLogic(auth: any): any[] {
    return [
      {
        operation: 'LOGIN',
        endpoint: '/api/auth/login',
        method: 'POST',
        validation: 'email_password_required',
        response: 'jwt_token'
      },
      {
        operation: 'REGISTER',
        endpoint: '/api/auth/register',
        method: 'POST',
        validation: 'email_password_name_required',
        response: 'user_data_and_token'
      },
      {
        operation: 'LOGOUT',
        endpoint: '/api/auth/logout',
        method: 'POST',
        validation: 'token_required',
        response: 'logout_confirmation'
      }
    ];
  }

  private generateWorkflowLogic(workflow: any, relationships: any[]): any[] {
    return [
      {
        operation: 'INITIATE_WORKFLOW',
        endpoint: `/api/workflow/${workflow.name.toLowerCase()}/start`,
        method: 'POST',
        validation: 'workflow_parameters',
        response: 'workflow_instance'
      },
      {
        operation: 'PROGRESS_WORKFLOW',
        endpoint: `/api/workflow/${workflow.name.toLowerCase()}/:id/progress`,
        method: 'PUT',
        validation: 'step_data',
        response: 'workflow_status'
      }
    ];
  }

  // Data flow generation methods
  private generateCRUDDataFlow(form: any): any[] {
    return [
      {
        step: 'VALIDATE_INPUT',
        component: form.id,
        action: 'validate_form_data',
        next: 'PROCESS_DATA'
      },
      {
        step: 'PROCESS_DATA',
        component: form.id,
        action: 'transform_data',
        next: 'SAVE_TO_DATABASE'
      },
      {
        step: 'SAVE_TO_DATABASE',
        component: form.id,
        action: 'persist_data',
        next: 'RETURN_RESPONSE'
      }
    ];
  }

  private generateSearchDataFlow(search: any): any[] {
    return [
      {
        step: 'PARSE_QUERY',
        component: search.id,
        action: 'parse_search_terms',
        next: 'EXECUTE_SEARCH'
      },
      {
        step: 'EXECUTE_SEARCH',
        component: search.id,
        action: 'search_database',
        next: 'RANK_RESULTS'
      },
      {
        step: 'RANK_RESULTS',
        component: search.id,
        action: 'rank_by_relevance',
        next: 'RETURN_RESULTS'
      }
    ];
  }

  private generateAuthDataFlow(auth: any): any[] {
    return [
      {
        step: 'VALIDATE_CREDENTIALS',
        component: auth.id,
        action: 'check_email_password',
        next: 'GENERATE_TOKEN'
      },
      {
        step: 'GENERATE_TOKEN',
        component: auth.id,
        action: 'create_jwt_token',
        next: 'RETURN_TOKEN'
      }
    ];
  }

  private generateWorkflowDataFlow(workflow: any, relationships: any[]): any[] {
    return [
      {
        step: 'INITIALIZE_WORKFLOW',
        component: workflow.id,
        action: 'create_workflow_instance',
        next: 'EXECUTE_FIRST_STEP'
      },
      {
        step: 'EXECUTE_STEP',
        component: workflow.id,
        action: 'process_workflow_step',
        next: 'CHECK_COMPLETION'
      },
      {
        step: 'CHECK_COMPLETION',
        component: workflow.id,
        action: 'check_workflow_complete',
        next: 'COMPLETE_OR_CONTINUE'
      }
    ];
  }

  // Validation generation methods
  private generateCRUDValidations(form: any): any[] {
    return [
      {
        field: 'required_fields',
        rule: 'all_required_fields_present',
        message: 'All required fields must be provided'
      },
      {
        field: 'data_types',
        rule: 'correct_data_types',
        message: 'Data types must match expected format'
      }
    ];
  }

  private generateSearchValidations(search: any): any[] {
    return [
      {
        field: 'search_query',
        rule: 'query_not_empty',
        message: 'Search query cannot be empty'
      },
      {
        field: 'query_length',
        rule: 'query_length_limit',
        message: 'Search query must be between 1 and 100 characters'
      }
    ];
  }

  private generateAuthValidations(auth: any): any[] {
    return [
      {
        field: 'email',
        rule: 'valid_email_format',
        message: 'Email must be in valid format'
      },
      {
        field: 'password',
        rule: 'password_strength',
        message: 'Password must meet security requirements'
      }
    ];
  }

  private generateWorkflowValidations(workflow: any): any[] {
    return [
      {
        field: 'workflow_parameters',
        rule: 'required_parameters_present',
        message: 'All required workflow parameters must be provided'
      },
      {
        field: 'step_data',
        rule: 'valid_step_data',
        message: 'Step data must be valid for current workflow state'
      }
    ];
  }

  // Component rule extraction
  private extractComponentRules(component: any): any[] {
    const rules = [];
    
    // Extract rules from component properties
    if (component.properties) {
      for (const [key, value] of Object.entries(component.properties)) {
        const rule = this.createRuleFromProperty(key, value, component);
        if (rule) {
          rules.push(rule);
        }
      }
    }
    
    return rules;
  }

  private createRuleFromProperty(key: string, value: any, component: any): any {
    return {
      componentId: component.id,
      property: key,
      value: value,
      rule: this.inferRuleFromValue(value),
      validation: this.createValidationFromValue(value)
    };
  }

  private inferRuleFromValue(value: any): string {
    if (typeof value === 'string') {
      if (value.includes('@')) return 'email_validation';
      if (value.length > 50) return 'text_length_limit';
      return 'string_validation';
    }
    if (typeof value === 'number') return 'number_validation';
    if (typeof value === 'boolean') return 'boolean_validation';
    return 'general_validation';
  }

  private createValidationFromValue(value: any): any {
    return {
      type: typeof value,
      required: true,
      minLength: typeof value === 'string' ? 1 : undefined,
      maxLength: typeof value === 'string' ? 255 : undefined,
      pattern: typeof value === 'string' && value.includes('@') ? 'email' : undefined
    };
  }

  // Pattern rule extraction
  private extractPatternRules(pattern: BusinessLogicPattern): any[] {
    const rules = [];
    
    for (const logic of pattern.suggestedLogic) {
      const rule = {
        patternType: pattern.type,
        operation: logic.operation,
        endpoint: logic.endpoint,
        method: logic.method,
        validation: logic.validation,
        response: logic.response
      };
      rules.push(rule);
    }
    
    return rules;
  }

  // Model generation methods
  private generateModelFromComponent(component: any, businessRules: any[]): any {
    return {
      name: component.name,
      type: 'component_model',
      properties: this.extractComponentProperties(component),
      required: this.extractRequiredProperties(component),
      validations: this.extractComponentValidations(component, businessRules)
    };
  }

  private generateModelFromRule(rule: any): any {
    return {
      name: `${rule.type}_model`,
      type: 'rule_model',
      properties: this.extractRuleProperties(rule),
      required: this.extractRequiredRuleProperties(rule),
      validations: this.extractRuleValidations(rule)
    };
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

  private extractComponentValidations(component: any, businessRules: any[]): any[] {
    const validations = [];
    
    // Add component-specific validations
    if (component.properties) {
      for (const [key, value] of Object.entries(component.properties)) {
        const validation = this.createValidationFromProperty(key, value);
        if (validation) {
          validations.push(validation);
        }
      }
    }
    
    // Add business rule validations
    const componentRules = businessRules.filter(rule => rule.componentId === component.id);
    for (const rule of componentRules) {
      validations.push(rule.validation);
    }
    
    return validations;
  }

  private extractRuleProperties(rule: any): any {
    return {
      operation: {
        type: 'string',
        description: 'Operation type',
        example: rule.operation
      },
      endpoint: {
        type: 'string',
        description: 'API endpoint',
        example: rule.endpoint
      },
      method: {
        type: 'string',
        description: 'HTTP method',
        example: rule.method
      }
    };
  }

  private extractRequiredRuleProperties(rule: any): string[] {
    return ['operation', 'endpoint', 'method'];
  }

  private extractRuleValidations(rule: any): any[] {
    return [
      {
        field: 'operation',
        rule: 'valid_operation',
        message: 'Operation must be valid'
      },
      {
        field: 'endpoint',
        rule: 'valid_endpoint_format',
        message: 'Endpoint must be in valid format'
      },
      {
        field: 'method',
        rule: 'valid_http_method',
        message: 'HTTP method must be valid'
      }
    ];
  }

  // Validation creation methods
  private createModelValidations(model: any): any[] {
    const validations = [];
    
    for (const [field, config] of Object.entries(model.properties)) {
      const validation = {
        field,
        rule: this.createValidationRule(config),
        message: this.createValidationMessage(field, config)
      };
      validations.push(validation);
    }
    
    return validations;
  }

  private createRuleValidations(rule: any): any[] {
    return [
      {
        field: 'rule_type',
        rule: 'valid_rule_type',
        message: 'Rule type must be valid'
      },
      {
        field: 'rule_data',
        rule: 'valid_rule_data',
        message: 'Rule data must be valid'
      }
    ];
  }

  private createValidationFromProperty(key: string, value: any): any {
    return {
      field: key,
      type: typeof value,
      required: value !== null && value !== undefined,
      minLength: typeof value === 'string' ? 1 : undefined,
      maxLength: typeof value === 'string' ? 255 : undefined,
      pattern: typeof value === 'string' && value.includes('@') ? 'email' : undefined
    };
  }

  private createValidationRule(config: any): string {
    if (config.type === 'string') {
      if (config.example?.includes('@')) return 'email_format';
      return 'string_format';
    }
    if (config.type === 'number') return 'number_format';
    if (config.type === 'boolean') return 'boolean_format';
    return 'general_format';
  }

  private createValidationMessage(field: string, config: any): string {
    if (config.type === 'string') {
      if (config.example?.includes('@')) return `${field} must be a valid email address`;
      return `${field} must be a valid string`;
    }
    if (config.type === 'number') return `${field} must be a valid number`;
    if (config.type === 'boolean') return `${field} must be a valid boolean`;
    return `${field} must be valid`;
  }

  // Missing method: generateWorkflowFromPattern
  private generateWorkflowFromPattern(pattern: BusinessLogicPattern, businessRules: any[]): any {
    if (pattern.type === 'WORKFLOW') {
      return {
        id: `workflow_${pattern.components[0]}`,
        type: 'workflow',
        steps: pattern.dataFlow,
        rules: businessRules.filter(rule => 
          pattern.components.includes(rule.componentId)
        ),
        logic: pattern.suggestedLogic
      };
    }
    return null;
  }
}