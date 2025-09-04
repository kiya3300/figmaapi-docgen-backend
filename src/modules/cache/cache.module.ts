import { Module } from '@nestjs/common';
import { CacheController } from './cache.controller';
import { CacheService } from './cache.service';

@Module({
  controllers: [CacheController],
  providers: [CacheService],
  exports: [CacheService], // Export CacheService so other modules can use it
})
export class CacheModule {} 