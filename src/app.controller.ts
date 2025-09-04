import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  @ApiResponse({ status: 200, description: 'Welcome message' })
  getHello() {
    return {
      message: 'Welcome to FigmaAPI-DocGen Backend',
      version: '1.0.0',
      documentation: '/api/docs',
      health: '/health',
    };
  }


} 