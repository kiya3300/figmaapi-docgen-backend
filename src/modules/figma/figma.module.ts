import { Module } from '@nestjs/common';
import { FigmaController } from './figma.controller';
import { FigmaService } from './figma.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  controllers: [FigmaController],
  providers: [FigmaService],
  exports: [FigmaService],
})
export class FigmaModule {} 