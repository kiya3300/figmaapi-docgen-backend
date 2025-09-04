import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class MLPatternRecognizerService {
  private mlServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.mlServiceUrl = this.configService.get<string>('ML_SERVICE_URL') || 
                      'https://your-ml-service.onrender.com';
  }

  async recognizePatterns(figmaData: any): Promise<any[]> {
    try {
      const response = await axios.post(`${this.mlServiceUrl}/ml/predict`, figmaData, {
        timeout: 30000, // 30 seconds timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });

      return response.data;
    } catch (error) {
      console.error('ML Service error:', error.message);
      // Fallback to basic pattern recognition
      return this.fallbackPatternRecognition(figmaData);
    }
  }

  async trainModel(trainingData: any[]): Promise<any> {
    try {
      const response = await axios.post(`${this.mlServiceUrl}/ml/train`, trainingData, {
        timeout: 120000, // 2 minutes timeout for training
        headers: {
          'Content-Type': 'application/json',
        }
      });

      return response.data;
    } catch (error) {
      console.error('ML Training error:', error.message);
      throw new Error('ML training failed');
    }
  }

  private fallbackPatternRecognition(figmaData: any): any[] {
    // Basic pattern recognition without ML
    const patterns = [];
    
    if (figmaData.components?.length > 0) {
      patterns.push({ type: 'crud', confidence: 0.7 });
    }
    
    if (figmaData.styles?.colors?.length > 0) {
      patterns.push({ type: 'auth', confidence: 0.6 });
    }
    
    return patterns;
  }
} 