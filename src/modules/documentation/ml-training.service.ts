import { Injectable } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';

interface TrainingData {
  id: string;
  figmaData: any;
  expectedPatterns: any[];
  userFeedback: {
    accuracy: number;
    corrections: any[];
    timestamp: Date;
  };
  metadata: {
    projectType: string;
    industry: string;
    complexity: number;
  };
}

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
}

@Injectable()
export class MLTrainingService {
  private model: tf.LayersModel;
  private modelPath = './models';
  private trainingData: TrainingData[] = [];

  constructor() {
    this.ensureModelDirectory();
  }

  private ensureModelDirectory(): void {
    if (!fs.existsSync(this.modelPath)) {
      fs.mkdirSync(this.modelPath, { recursive: true });
    }
  }

  async trainModel(trainingData: TrainingData[]): Promise<ModelMetrics> {
    this.trainingData = trainingData;

    // Prepare training data
    const { features, labels } = this.prepareTrainingData(trainingData);
    
    // Create model
    this.model = this.createModel();
    
    // Train model
    const history = await this.model.fit(features, labels, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: [
        tf.callbacks.earlyStopping({
          monitor: 'val_loss',
          patience: 10,
          restoreBestWeights: true
        })
      ]
    });

    // Save model
    await this.saveModel();
    
    // Evaluate model
    return this.evaluateModel(features, labels);
  }

  private createModel(): tf.LayersModel {
    const model = tf.sequential();
    
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
      inputShape: [50]
    }));
    
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dense({
      units: 10,
      activation: 'softmax'
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private prepareTrainingData(data: TrainingData[]): { features: tf.Tensor, labels: tf.Tensor } {
    const features = data.map(item => this.extractFeatures(item.figmaData));
    const labels = data.map(item => this.encodeLabels(item.expectedPatterns));
    
    return {
      features: tf.tensor2d(features),
      labels: tf.tensor2d(labels)
    };
  }

  private extractFeatures(figmaData: any): number[] {
    // Extract 50 features from Figma data
    const features = [];
    
    // Component count features
    features.push(figmaData.components?.length || 0);
    features.push(figmaData.frames?.length || 0);
    features.push(figmaData.pages?.length || 0);
    
    // Style features
    features.push(figmaData.styles?.colors?.length || 0);
    features.push(figmaData.styles?.textStyles?.length || 0);
    features.push(figmaData.styles?.effects?.length || 0);
    
    // Layout features
    features.push(figmaData.layoutGrids?.length || 0);
    features.push(figmaData.constraints?.length || 0);
    
    // Fill remaining features with zeros
    while (features.length < 50) {
      features.push(0);
    }
    
    return features;
  }

  private encodeLabels(patterns: any[]): number[] {
    const labelVector = new Array(10).fill(0);
    
    patterns.forEach(pattern => {
      switch (pattern.type) {
        case 'crud':
          labelVector[0] = 1;
          break;
        case 'auth':
          labelVector[1] = 1;
          break;
        case 'file':
          labelVector[2] = 1;
          break;
        case 'search':
          labelVector[3] = 1;
          break;
        case 'notification':
          labelVector[4] = 1;
          break;
        case 'analytics':
          labelVector[5] = 1;
          break;
        case 'payment':
          labelVector[6] = 1;
          break;
        case 'social':
          labelVector[7] = 1;
          break;
        case 'real-time':
          labelVector[8] = 1;
          break;
        case 'export':
          labelVector[9] = 1;
          break;
      }
    });
    
    return labelVector;
  }

  private async saveModel(): Promise<void> {
    await this.model.save(`file://${this.modelPath}/latest`);
  }

  private async evaluateModel(features: tf.Tensor, labels: tf.Tensor): Promise<ModelMetrics> {
    const predictions = this.model.predict(features) as tf.Tensor;
    const predictedLabels = predictions.argMax(1);
    const trueLabels = labels.argMax(1);
    
    // Calculate metrics
    const accuracy = await this.calculateAccuracy(predictedLabels, trueLabels);
    const { precision, recall, f1Score } = await this.calculatePrecisionRecall(predictedLabels, trueLabels);
    
    return {
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix: await this.calculateConfusionMatrix(predictedLabels, trueLabels)
    };
  }

  private async calculateAccuracy(predicted: tf.Tensor, actualLabels: tf.Tensor): Promise<number> {
    const correct = predicted.equal(actualLabels).sum();
    const total = predicted.size;
    return correct.div(total).dataSync()[0];
  }

  private async calculatePrecisionRecall(predicted: tf.Tensor, actualLabels: tf.Tensor): Promise<{ precision: number, recall: number, f1Score: number }> {
    // Simplified calculation
    const correct = predicted.equal(actualLabels).sum().dataSync()[0];
    const total = predicted.size;
    
    const precision = correct / total;
    const recall = correct / total;
    const f1Score = 2 * (precision * recall) / (precision + recall);
    
    return { precision, recall, f1Score };
  }

  private async calculateConfusionMatrix(predicted: tf.Tensor, actualLabels: tf.Tensor): Promise<number[][]> {
    // Simplified confusion matrix calculation
    const matrix = Array(10).fill(0).map(() => Array(10).fill(0));
    const predArray = await predicted.array() as number[];
    const trueArray = await actualLabels.array() as number[];
    
    for (let i = 0; i < predArray.length; i++) {
      matrix[trueArray[i]][predArray[i]]++;
    }
    
    return matrix;
  }

  async loadModel(): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(`file://${this.modelPath}/latest/model.json`);
    } catch (error) {
      console.log('No saved model found, creating new one');
      this.model = this.createModel();
    }
  }

  async predictPatterns(figmaData: any): Promise<any[]> {
    const features = this.extractFeatures(figmaData);
    const input = tf.tensor2d([features]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const result = await prediction.array();
    
    return this.decodePrediction(result[0]);
  }

  private decodePrediction(prediction: number[]): any[] {
    const patterns = [];
    const threshold = 0.5;
    
    const patternTypes = ['crud', 'auth', 'file', 'search', 'notification', 'analytics', 'payment', 'social', 'real-time', 'export'];
    
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

  async addUserFeedback(dataId: string, feedback: any): Promise<void> {
    const dataIndex = this.trainingData.findIndex(d => d.id === dataId);
    if (dataIndex !== -1) {
      this.trainingData[dataIndex].userFeedback = feedback;
    }
  }

  async retrainWithFeedback(): Promise<ModelMetrics> {
    return this.trainModel(this.trainingData);
  }
} 