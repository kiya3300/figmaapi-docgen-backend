import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MLModelService } from './ml-model.service';

@ApiTags('ML Model')
@Controller('ml')
export class MLModelController {
  constructor(private readonly mlService: MLModelService) {}

  @Post('predict')
  @ApiOperation({ summary: 'Predict patterns from Figma data' })
  @ApiResponse({ status: 200, description: 'Prediction successful' })
  async predictPatterns(@Body() figmaData: any) {
    return this.mlService.predictPatterns(figmaData);
  }

  @Post('train')
  @ApiOperation({ summary: 'Train model with new data' })
  @ApiResponse({ status: 200, description: 'Training completed' })
  async trainModel(@Body() trainingData: any) {
    return this.mlService.trainModel(trainingData);
  }

  @Get('health')
  @ApiOperation({ summary: 'ML service health check' })
  async healthCheck() {
    return { status: 'healthy', model: 'loaded' };
  }
} 