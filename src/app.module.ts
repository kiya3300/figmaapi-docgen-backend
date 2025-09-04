import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthController } from './health.controller';
import { AppController } from './app.controller';
import { ProjectsModule } from './modules/projects/projects.module';
import { FigmaModule } from './modules/figma/figma.module';
import { DocumentationModule } from './modules/documentation/documentation.module';
import { CacheModule as CacheManagementModule } from './modules/cache/cache.module';
import { AdminModule } from './modules/admin/admin.module';
import { ApiClientModule } from './modules/api-client/api-client.module';


@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    
    // Cache management
    CacheModule.register({
      isGlobal: true,
      ttl: 3600,
    }),
    
    // Background jobs
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    
    // Feature modules
    AuthModule,
    UsersModule,
    ProjectsModule,
    FigmaModule,
    DocumentationModule,
    CacheManagementModule,
    AdminModule,
    ApiClientModule,
  ],
  controllers: [AppController, HealthController],
  providers: [],
})
export class AppModule {} 