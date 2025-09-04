import { Module } from '@nestjs/common';
import { DocumentationController } from './documentation.controller';
import { DocumentationService } from './documentation.service';
import { MLPatternRecognizerService } from './ml-pattern-recognizer.service';
import { AdvancedSchemaGeneratorService } from './advanced-schema-generator.service';
import { BusinessLogicExtractorService } from './business-logic-extractor.service';
import { SecurityGeneratorService } from './security-generator.service';
import { EnhancedDocumentationService } from './enhanced-documentation.service';
import { MLTrainingService } from './ml-training.service';
import { SchemaValidationService } from './schema-validation.service';
import { ProductionFeaturesService } from './production-features.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  controllers: [DocumentationController],
  providers: [
    DocumentationService,
    MLPatternRecognizerService,
    AdvancedSchemaGeneratorService,
    BusinessLogicExtractorService,
    SecurityGeneratorService,
    EnhancedDocumentationService,
    MLTrainingService,
    SchemaValidationService,
    ProductionFeaturesService
  ],
  exports: [
    DocumentationService,
    MLPatternRecognizerService,
    AdvancedSchemaGeneratorService,
    BusinessLogicExtractorService,
    SecurityGeneratorService,
    EnhancedDocumentationService,
    MLTrainingService,
    SchemaValidationService,
    ProductionFeaturesService
  ],
})
export class DocumentationModule {}