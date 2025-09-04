import { Injectable, NotFoundException, BadRequestException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

interface CacheEntry {
  id: string;
  key: string;
  type: string;
  value: any;
  size: number;
  hitCount: number;
  status: 'active' | 'expired' | 'evicted';
  lastAccessed: Date;
  expiresAt: Date;
  createdAt: Date;
  ttl: number;
}

interface CacheConfig {
  defaultTtl: number;
  maxSize: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo';
  compression: boolean;
  typeConfigs: Record<string, { ttl: number; maxSize: number }>;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private cache = new Map<string, CacheEntry>();
  private cacheAnalytics = new Map<string, any>();
  private cleanupInterval: NodeJS.Timeout;
  private memoryMonitorInterval: NodeJS.Timeout;
  private analyticsInterval: NodeJS.Timeout;
  private totalRequests = 0;
  private totalHits = 0;
  private totalMisses = 0;

  private cacheConfig: CacheConfig = {
    defaultTtl: 3600, // 1 hour
    maxSize: 100 * 1024 * 1024, // 100MB
    evictionPolicy: 'lru',
    compression: true,
    typeConfigs: {
      user: { ttl: 1800, maxSize: 50 * 1024 * 1024 }, // 30 min, 50MB
      project: { ttl: 7200, maxSize: 100 * 1024 * 1024 }, // 2 hours, 100MB
      figma: { ttl: 3600, maxSize: 20 * 1024 * 1024 }, // 1 hour, 20MB
      documentation: { ttl: 86400, maxSize: 100 * 1024 * 1024 }, // 24 hours, 100MB
      analytics: { ttl: 300, maxSize: 5 * 1024 * 1024 }, // 5 min, 5MB
      system: { ttl: 600, maxSize: 1 * 1024 * 1024 } // 10 min, 1MB
    }
  };

  async onModuleInit() {
    this.startBackgroundProcesses();
    this.initializeMockData();
  }

  async onModuleDestroy() {
    this.stopBackgroundProcesses();
  }

  // ==================== CORE CACHE OPERATIONS ====================

  async set(key: string, value: any, ttl?: number, type: string = 'system'): Promise<void> {
    const config = this.cacheConfig.typeConfigs[type] || { ttl: this.cacheConfig.defaultTtl, maxSize: this.cacheConfig.maxSize };
    const entryTtl = ttl || config.ttl;
    const expiresAt = new Date(Date.now() + entryTtl * 1000);
    const size = this.calculateSize(value);
    
    // Check if we need to evict entries due to size limit
    await this.enforceMemoryLimits(type, size);

    const entry: CacheEntry = {
      id: uuidv4(),
      key,
      type,
      value,
      size,
      hitCount: 0,
      status: 'active',
      lastAccessed: new Date(),
      expiresAt,
      createdAt: new Date(),
      ttl: entryTtl
    };

    this.cache.set(key, entry);
    this.updateAnalytics('set', type, size);
  }

  async get(key: string): Promise<any> {
    this.totalRequests++;
    const entry = this.cache.get(key);

    if (!entry) {
      this.totalMisses++;
      this.updateAnalytics('miss', entry?.type || 'unknown', 0);
      return null;
    }

    // Check if expired
    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      entry.status = 'expired';
      this.totalMisses++;
      this.updateAnalytics('expired', entry.type, 0);
      return null;
    }

    // Update access statistics
    entry.hitCount++;
    entry.lastAccessed = new Date();
    this.totalHits++;
    this.updateAnalytics('hit', entry.type, entry.size);

    return entry.value;
  }

  async delete(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.updateAnalytics('delete', entry.type, entry.size);
    return true;
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // ==================== AUTOMATIC CACHE CLEANER ====================

  private startBackgroundProcesses() {
    // Clean expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanExpiredEntries();
    }, 60000);

    // Monitor memory every 30 seconds
    this.memoryMonitorInterval = setInterval(() => {
      this.monitorMemoryUsage();
    }, 30000);

    // Update analytics every 5 minutes
    this.analyticsInterval = setInterval(() => {
      this.updateAnalyticsSummary();
    }, 300000);
  }

  private stopBackgroundProcesses() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    if (this.memoryMonitorInterval) clearInterval(this.memoryMonitorInterval);
    if (this.analyticsInterval) clearInterval(this.analyticsInterval);
  }

  private cleanExpiredEntries(): void {
    const now = new Date();
    let cleanedCount = 0;
    let cleanedSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        entry.status = 'expired';
        cleanedCount++;
        cleanedSize += entry.size;
        this.updateAnalytics('expired', entry.type, entry.size);
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cache cleaner: Removed ${cleanedCount} expired entries (${this.formatBytes(cleanedSize)})`);
    }
  }

  private monitorMemoryUsage(): void {
    const currentMemory = this.calculateTotalSize();
    const maxMemory = this.cacheConfig.maxSize;
    const usagePercentage = (currentMemory / maxMemory) * 100;

    if (usagePercentage > 90) {
      console.warn(`Cache memory usage critical: ${usagePercentage.toFixed(2)}%`);
      this.forceEviction();
    } else if (usagePercentage > 80) {
      console.warn(`Cache memory usage high: ${usagePercentage.toFixed(2)}%`);
      this.enforceMemoryLimits();
    }
  }

  private enforceMemoryLimits(type?: string, newEntrySize: number = 0): void {
    const typeConfig = type ? this.cacheConfig.typeConfigs[type] : null;
    const maxSize = typeConfig ? typeConfig.maxSize : this.cacheConfig.maxSize;
    
    let currentSize = this.calculateTotalSizeByType(type || 'all');
    if (newEntrySize > 0) currentSize += newEntrySize;

    if (currentSize > maxSize) {
      this.evictEntries(type, currentSize - maxSize);
    }
  }

  private evictEntries(type: string, targetSize: number): void {
    const entries = Array.from(this.cache.entries())
      .filter(([_, entry]) => type === 'all' || entry.type === type)
      .map(([key, entry]) => ({ key, entry }));

    // Sort by eviction policy
    switch (this.cacheConfig.evictionPolicy) {
      case 'lru':
        entries.sort((a, b) => a.entry.lastAccessed.getTime() - b.entry.lastAccessed.getTime());
        break;
      case 'lfu':
        entries.sort((a, b) => a.entry.hitCount - b.entry.hitCount);
        break;
      case 'fifo':
        entries.sort((a, b) => a.entry.createdAt.getTime() - b.entry.createdAt.getTime());
        break;
    }

    let evictedSize = 0;
    let evictedCount = 0;

    for (const { key, entry } of entries) {
      if (evictedSize >= targetSize) break;
      
      this.cache.delete(key);
      entry.status = 'evicted';
      evictedSize += entry.size;
      evictedCount++;
      this.updateAnalytics('evicted', entry.type, entry.size);
    }

    if (evictedCount > 0) {
      console.log(`Cache eviction: Removed ${evictedCount} entries (${this.formatBytes(evictedSize)})`);
    }
  }

  private forceEviction(): void {
    const currentSize = this.calculateTotalSize();
    const targetSize = this.cacheConfig.maxSize * 0.7; // Reduce to 70%
    
    if (currentSize > targetSize) {
      this.evictEntries('all', currentSize - targetSize);
    }
  }

  // ==================== MEMORY MANAGEMENT ====================

  private calculateSize(value: any): number {
    return JSON.stringify(value).length;
  }

  private calculateTotalSize(): number {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  private calculateTotalSizeByType(type: string): number {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      if (type === 'all' || entry.type === type) {
        totalSize += entry.size;
      }
    }
    return totalSize;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ==================== ANALYTICS & MONITORING ====================

  private updateAnalytics(action: string, type: string, size: number): void {
    const now = new Date();
    const hourKey = now.toISOString().slice(0, 13) + ':00:00.000Z';
    
    if (!this.cacheAnalytics.has(hourKey)) {
      this.cacheAnalytics.set(hourKey, {
        timestamp: hourKey,
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        expired: 0,
        evicted: 0,
        totalSize: 0,
        byType: {}
      });
    }

    const analytics = this.cacheAnalytics.get(hourKey);
    
    switch (action) {
      case 'hit':
        analytics.hits++;
        break;
      case 'miss':
        analytics.misses++;
        break;
      case 'set':
        analytics.sets++;
        analytics.totalSize += size;
        break;
      case 'delete':
        analytics.deletes++;
        break;
      case 'expired':
        analytics.expired++;
        break;
      case 'evicted':
        analytics.evicted++;
        break;
    }

    // Update type-specific analytics
    if (!analytics.byType[type]) {
      analytics.byType[type] = { hits: 0, misses: 0, sets: 0, size: 0 };
    }
    
    const typeAnalytics = analytics.byType[type];
    switch (action) {
      case 'hit':
        typeAnalytics.hits++;
        break;
      case 'miss':
        typeAnalytics.misses++;
        break;
      case 'set':
        typeAnalytics.sets++;
        typeAnalytics.size += size;
        break;
    }
  }

  private updateAnalyticsSummary(): void {
    // Clean old analytics (keep last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    for (const [key, analytics] of this.cacheAnalytics.entries()) {
      if (new Date(analytics.timestamp) < thirtyDaysAgo) {
        this.cacheAnalytics.delete(key);
      }
    }
  }

  // ==================== PUBLIC API METHODS ====================

  async getCacheStats(): Promise<any> {
    const entries = Array.from(this.cache.values());
    const totalEntries = entries.length;
    const totalSize = this.calculateTotalSize();
    
    const hitRate = this.totalRequests > 0 ? this.totalHits / this.totalRequests : 0;
    const missRate = 1 - hitRate;

    const entriesByType = this.groupEntriesByType(entries, 'count');
    const sizeByType = this.groupEntriesByType(entries, 'size');
    const statusDistribution = this.getStatusDistribution(entries);

    return {
      totalEntries,
      totalSize,
      hitRate,
      missRate,
      avgResponseTime: this.calculateAverageResponseTime(),
      entriesByType,
      sizeByType,
      statusDistribution,
      memoryUsage: {
        current: totalSize,
        max: this.cacheConfig.maxSize,
        percentage: (totalSize / this.cacheConfig.maxSize) * 100
      },
      lastUpdated: new Date(),
    };
  }

  async getCacheEntries(
    paginationDto: any, 
    cacheType?: string, 
    search?: string, 
    sortBy?: string, 
    sortOrder?: string
  ): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto;
    
    let entries = Array.from(this.cache.values());

    // Filter by cache type
    if (cacheType) {
      entries = entries.filter(entry => entry.type === cacheType);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      entries = entries.filter(entry => 
        entry.key.toLowerCase().includes(searchLower) ||
        JSON.stringify(entry.value).toLowerCase().includes(searchLower)
      );
    }

    // Sort entries
    if (sortBy) {
      entries.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'created':
            aValue = a.createdAt.getTime();
            bValue = b.createdAt.getTime();
            break;
          case 'accessed':
            aValue = a.lastAccessed.getTime();
            bValue = b.lastAccessed.getTime();
            break;
          case 'size':
            aValue = a.size;
            bValue = b.size;
            break;
          case 'hits':
            aValue = a.hitCount;
            bValue = b.hitCount;
            break;
          default:
            aValue = a.key;
            bValue = b.key;
        }

        if (sortOrder === 'desc') {
          return bValue - aValue;
        }
        return aValue - bValue;
      });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntries = entries.slice(startIndex, endIndex);

    return {
      data: paginatedEntries,
      pagination: {
        page,
        limit,
        total: entries.length,
        pages: Math.ceil(entries.length / limit),
      },
    };
  }

  async getCacheEntry(key: string): Promise<any> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      throw new NotFoundException('Cache entry not found');
    }

    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      throw new NotFoundException('Cache entry has expired');
    }

    // Update hit count and last accessed
    entry.hitCount++;
    entry.lastAccessed = new Date();

    return entry;
  }

  async deleteCacheEntry(key: string): Promise<any> {
    const success = await this.delete(key);
    
    if (!success) {
      throw new NotFoundException('Cache entry not found');
    }

    return {
      message: 'Cache entry deleted successfully',
      success: true,
    };
  }

  async refreshCache(refreshCacheDto: any): Promise<any> {
    const { cacheType, keys, refreshAll } = refreshCacheDto;

    if (refreshAll) {
      // Refresh all cache entries
      for (const entry of this.cache.values()) {
        entry.lastAccessed = new Date();
        entry.hitCount = 0;
        entry.expiresAt = new Date(Date.now() + entry.ttl * 1000);
      }

      return {
        message: 'All cache entries refreshed successfully',
        success: true,
      };
    }

    if (cacheType) {
      // Refresh entries by type
      let refreshedCount = 0;
      for (const entry of this.cache.values()) {
        if (entry.type === cacheType) {
          entry.lastAccessed = new Date();
          entry.hitCount = 0;
          entry.expiresAt = new Date(Date.now() + entry.ttl * 1000);
          refreshedCount++;
        }
      }

      return {
        message: `Cache entries of type '${cacheType}' refreshed successfully`,
        success: true,
        refreshedCount,
      };
    }

    if (keys && keys.length > 0) {
      // Refresh specific keys
      let refreshedCount = 0;
      for (const key of keys) {
        const entry = this.cache.get(key);
        if (entry) {
          entry.lastAccessed = new Date();
          entry.hitCount = 0;
          entry.expiresAt = new Date(Date.now() + entry.ttl * 1000);
          refreshedCount++;
        }
      }

      return {
        message: `${refreshedCount} cache entries refreshed successfully`,
        success: true,
        refreshedCount,
      };
    }

    throw new BadRequestException('No refresh criteria specified');
  }

  async clearCache(cacheType?: string): Promise<any> {
    if (cacheType) {
      // Clear cache by type
      let clearedCount = 0;
      for (const [key, entry] of this.cache.entries()) {
        if (entry.type === cacheType) {
          this.cache.delete(key);
          clearedCount++;
        }
      }

      return {
        message: `Cache entries of type '${cacheType}' cleared successfully`,
        success: true,
        clearedCount,
      };
    }

    // Clear all cache
    const clearedCount = this.cache.size;
    this.cache.clear();

    return {
      message: 'All cache entries cleared successfully',
      success: true,
      clearedCount,
    };
  }

  async getCacheHealth(): Promise<any> {
    const totalSize = this.calculateTotalSize();
    const hitRate = this.totalRequests > 0 ? this.totalHits / this.totalRequests : 0;
    const memoryUsage = (totalSize / this.cacheConfig.maxSize) * 100;

    return {
      status: memoryUsage > 90 ? 'critical' : memoryUsage > 80 ? 'warning' : 'healthy',
      uptime: process.uptime(),
      memoryUsage: {
        current: totalSize,
        max: this.cacheConfig.maxSize,
        percentage: memoryUsage
      },
      hitRate,
      avgResponseTime: this.calculateAverageResponseTime(),
      totalRequests: this.totalRequests,
      totalHits: this.totalHits,
      totalMisses: this.totalMisses,
      lastCheck: new Date(),
    };
  }

  async updateCacheConfig(cacheConfigDto: any): Promise<any> {
    // Update cache configuration
    Object.assign(this.cacheConfig, cacheConfigDto);

    // Recalculate memory limits after config change
    this.enforceMemoryLimits();

    return {
      message: 'Cache configuration updated successfully',
      success: true,
      config: this.cacheConfig,
    };
  }

  async getCacheAnalytics(period?: string, cacheType?: string): Promise<any> {
    const analyticsPeriod = period || '24h';
    const endDate = new Date();
    const startDate = this.getStartDate(analyticsPeriod);

    const analyticsData = this.getAnalyticsData(startDate, endDate, cacheType);
    
    return {
      period: analyticsPeriod,
      cacheType,
      ...analyticsData,
    };
  }

  async getCachePerformance(period?: string): Promise<any> {
    const analyticsPeriod = period || '24h';
    const endDate = new Date();
    const startDate = this.getStartDate(analyticsPeriod);

    const hitRate = this.totalRequests > 0 ? this.totalHits / this.totalRequests : 0;
    const missRate = 1 - hitRate;
    const avgResponseTime = this.calculateAverageResponseTime();
    const throughput = this.calculateThroughput(startDate, endDate);
    const memoryEfficiency = this.calculateMemoryEfficiency();
    const trends = this.getPerformanceTrends(startDate, endDate);

    return {
      hitRate,
      missRate,
      avgResponseTime,
      throughput,
      memoryEfficiency,
      trends,
    };
  }

  async getCacheSizeDistribution(): Promise<any> {
    const entries = Array.from(this.cache.values());
    const totalSize = this.calculateTotalSize();
    const averageSize = entries.length > 0 ? totalSize / entries.length : 0;

    // Create size distribution
    const sizeRanges = [
      { min: 0, max: 1024, label: '0-1KB' },
      { min: 1024, max: 10240, label: '1-10KB' },
      { min: 10240, max: 102400, label: '10-100KB' },
      { min: 102400, max: 1048576, label: '100KB-1MB' },
      { min: 1048576, max: Infinity, label: '>1MB' },
    ];

    const sizeDistribution = sizeRanges.map(range => {
      const count = entries.filter(entry => 
        entry.size >= range.min && entry.size < range.max
      ).length;
      
      return {
        range: range.label,
        count,
        percentage: entries.length > 0 ? (count / entries.length) * 100 : 0,
      };
    });

    return {
      totalSize,
      averageSize,
      sizeDistribution,
    };
  }

  // ==================== HELPER METHODS ====================

  private calculateAverageResponseTime(): number {
    // Mock average response time calculation (in real app, track actual response times)
    return Math.random() * 5 + 1; // 1-6ms
  }

  private groupEntriesByType(entries: CacheEntry[], metric: string): Record<string, number> {
    const grouped: Record<string, number> = {};
    
    entries.forEach(entry => {
      if (!grouped[entry.type]) {
        grouped[entry.type] = 0;
      }
      
      if (metric === 'count') {
        grouped[entry.type]++;
      } else if (metric === 'size') {
        grouped[entry.type] += entry.size;
      }
    });

    return grouped;
  }

  private getStatusDistribution(entries: CacheEntry[]): Record<string, number> {
    const distribution: Record<string, number> = {
      active: 0,
      expired: 0,
      evicted: 0,
    };

    entries.forEach(entry => {
      distribution[entry.status]++;
    });

    return distribution;
  }

  private calculateThroughput(startDate: Date, endDate: Date): number {
    // Calculate requests per second
    const timeDiff = (endDate.getTime() - startDate.getTime()) / 1000;
    return timeDiff > 0 ? this.totalRequests / timeDiff : 0;
  }

  private calculateMemoryEfficiency(): number {
    const totalSize = this.calculateTotalSize();
    return totalSize > 0 ? (totalSize / this.cacheConfig.maxSize) : 0;
  }

  private getStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  private getAnalyticsData(startDate: Date, endDate: Date, cacheType?: string): any {
    const totalRequests = this.totalRequests;
    const totalHits = this.totalHits;
    const totalMisses = this.totalMisses;
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;
    const avgResponseTime = this.calculateAverageResponseTime();

    return {
      hitRate,
      missRate: 1 - hitRate,
      avgResponseTime,
      totalRequests,
      totalHits,
      totalMisses,
      peakMemoryUsage: this.cacheConfig.maxSize,
      avgMemoryUsage: this.calculateTotalSize(),
      hourlyData: this.generateHourlyData(startDate, endDate),
      typeBreakdown: this.generateTypeBreakdown(),
    };
  }

  private generateHourlyData(startDate: Date, endDate: Date): any[] {
    const data = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const hourKey = current.toISOString().slice(0, 13) + ':00:00.000Z';
      const analytics = this.cacheAnalytics.get(hourKey) || { hits: 0, misses: 0, hitRate: 0, avgResponseTime: 0 };
      
      data.push({
        hour: hourKey,
        hits: analytics.hits,
        misses: analytics.misses,
        hitRate: analytics.hits + analytics.misses > 0 ? analytics.hits / (analytics.hits + analytics.misses) : 0,
        avgResponseTime: this.calculateAverageResponseTime(),
      });
      current.setHours(current.getHours() + 1);
    }

    return data;
  }

  private generateTypeBreakdown(): Record<string, any> {
    const types = ['user', 'project', 'figma', 'documentation', 'analytics'];
    const breakdown: Record<string, any> = {};

    types.forEach(type => {
      const entries = Array.from(this.cache.values()).filter(entry => entry.type === type);
      const hits = entries.reduce((sum, entry) => sum + entry.hitCount, 0);
      const misses = this.totalMisses * (entries.length / this.cache.size); // Estimate
      breakdown[type] = {
        hits,
        misses,
        hitRate: hits + misses > 0 ? hits / (hits + misses) : 0,
      };
    });

    return breakdown;
  }

  private getPerformanceTrends(startDate: Date, endDate: Date): any[] {
    const trends = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      trends.push({
        timestamp: current.toISOString(),
        hitRate: this.totalRequests > 0 ? this.totalHits / this.totalRequests : 0,
        responseTime: this.calculateAverageResponseTime(),
      });
      current.setHours(current.getHours() + 1);
    }

    return trends;
  }

  // ==================== MOCK DATA INITIALIZATION ====================

  private initializeMockData() {
    // Create sample cache entries
    const sampleEntries = [
      {
        key: 'user:123',
        value: { id: 123, name: 'John Doe', email: 'john@example.com' },
        type: 'user',
        ttl: 1800
      },
      {
        key: 'project:456',
        value: { id: 456, name: 'E-commerce API', description: 'API documentation' },
        type: 'project',
        ttl: 7200
      },
      {
        key: 'figma:789',
        value: { fileId: 'FigmaFileKey123', name: 'Design System', components: 150 },
        type: 'figma',
        ttl: 3600
      },
    ];

    sampleEntries.forEach(entry => {
      this.set(entry.key, entry.value, entry.ttl, entry.type);
    });
  }
} 