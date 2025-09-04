import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MLModelController } from './ml-model.controller';
import { MLModelService } from './ml-model.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [MLModelController],
  providers: [MLModelService],
})
export class AppModule {} 