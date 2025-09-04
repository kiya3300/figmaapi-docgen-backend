import { Injectable } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';

@Injectable()
export class MLModelService {
  private model: tf.LayersModel;
  private modelLoaded = false;

  constructor() {
    this.loadModel();
  }

  private async loadModel() {
    try {
      // Load pre-trained model from Render's persistent disk
      this.model = await tf.loadLayersModel('file://./models/latest/model.json');
      this.modelLoaded = true;
      console.log('ML Model loaded successfully');
    } catch (error) {
      console.log('No pre-trained model found, creating new one');
      this.model = this.createModel();
      this.modelLoaded = true;
    }
  }

  private createModel(): tf.LayersModel {
    const model = tf.sequential();
    
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
      inputShape: [50]
    }));
    
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async predictPatterns(figmaData: any): Promise<any[]> {
    if (!this.modelLoaded) {
      await this.loadModel();
    }

    const features = this.extractFeatures(figmaData);
    const input = tf.tensor2d([features]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const result = await prediction.array();
    
    return this.decodePrediction(result[0]);
  }

  private extractFeatures(figmaData: any): number[] {
    const features = [];
    
    // Extract 50 features from Figma data
    features.push(figmaData.components?.length || 0);
    features.push(figmaData.frames?.length || 0);
    features.push(figmaData.pages?.length || 0);
    features.push(figmaData.styles?.colors?.length || 0);
    features.push(figmaData.styles?.textStyles?.length || 0);
    features.push(figmaData.styles?.effects?.length || 0);
    features.push(figmaData.layoutGrids?.length || 0);
    features.push(figmaData.constraints?.length || 0);
    
    // Fill remaining features
    while (features.length < 50) {
      features.push(0);
    }
    
    return features;
  }

  private decodePrediction(prediction: number[]): any[] {
    const patterns = [];
    const threshold = 0.5;
    
    const patternTypes = [
      'crud', 'auth', 'file', 'search', 'notification', 
      'analytics', 'payment', 'social', 'real-time', 'export'
    ];
    
    prediction.forEach((confidence, index) => {
      if (confidence > threshold) {
        patterns.push({
          type: patternTypes[index],
          confidence
        });
      }
    });
    
    return patterns;
  }

  async trainModel(trainingData: any[]): Promise<any> {
    if (!this.modelLoaded) {
      await this.loadModel();
    }

    const { features, labels } = this.prepareTrainingData(trainingData);
    
    const history = await this.model.fit(features, labels, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: [
        tf.callbacks.earlyStopping({
          monitor: 'val_loss',
          patience: 5,
          restoreBestWeights: true
        })
      ]
    });

    // Save model to persistent storage
    await this.model.save('file://./models/latest');
    
    return {
      accuracy: history.history.accuracy[history.history.accuracy.length - 1],
      loss: history.history.loss[history.history.loss.length - 1]
    };
  }

  private prepareTrainingData(data: any[]): { features: tf.Tensor, labels: tf.Tensor } {
    const features = data.map(item => this.extractFeatures(item.figmaData));
    const labels = data.map(item => this.encodeLabels(item.expectedPatterns));
    
    return {
      features: tf.tensor2d(features),
      labels: tf.tensor2d(labels)
    };
  }

  private encodeLabels(patterns: any[]): number[] {
    const labelVector = new Array(10).fill(0);
    
    patterns.forEach(pattern => {
      switch (pattern.type) {
        case 'crud': labelVector[0] = 1; break;
        case 'auth': labelVector[1] = 1; break;
        case 'file': labelVector[2] = 1; break;
        case 'search': labelVector[3] = 1; break;
        case 'notification': labelVector[4] = 1; break;
        case 'analytics': labelVector[5] = 1; break;
        case 'payment': labelVector[6] = 1; break;
        case 'social': labelVector[7] = 1; break;
        case 'real-time': labelVector[8] = 1; break;
        case 'export': labelVector[9] = 1; break;
      }
    });
    
    return labelVector;
  }
} 