import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// Mock data (replace with Prisma in production)
const users = new Map();
const userBans = new Map();
const systemMetrics = new Map();

@Injectable()
export class AdminService {
  async getUsers(
    paginationDto: any, 
    status?: string, 
    plan?: string, 
    search?: string
  ): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto;
    
    let allUsers = Array.from(users.values());

    // Filter by status
    if (status) {
      allUsers = allUsers.filter(user => user.status === status);
    }

    // Filter by plan
    if (plan) {
      allUsers = allUsers.filter(user => user.plan === plan);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      allUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Add additional data
    const enrichedUsers = allUsers.map(user => ({
      ...user,
      projectCount: this.getUserProjectCount(user.id),
      teamMemberCount: this.getUserTeamMemberCount(user.id),
      storageUsed: this.getUserStorageUsed(user.id),
      banReason: this.getUserBanReason(user.id),
      banExpiresAt: this.getUserBanExpiration(user.id),
    }));

    // Sort by creation date (newest first)
    enrichedUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = enrichedUsers.slice(startIndex, endIndex);

    return {
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total: enrichedUsers.length,
        pages: Math.ceil(enrichedUsers.length / limit),
      },
    };
  }

  async getUser(userId: string): Promise<any> {
    const user = users.get(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      projectCount: this.getUserProjectCount(userId),
      teamMemberCount: this.getUserTeamMemberCount(userId),
      storageUsed: this.getUserStorageUsed(userId),
      banReason: this.getUserBanReason(userId),
      banExpiresAt: this.getUserBanExpiration(userId),
    };
  }

  async banUser(userId: string, banUserDto: any): Promise<any> {
    const user = users.get(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { reason, duration, notes } = banUserDto;

    // Create ban record
    const ban = {
      id: uuidv4(),
      userId,
      reason,
      duration,
      notes,
      bannedAt: new Date(),
      expiresAt: duration > 0 ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null,
      bannedBy: 'admin', // In real app, get from request
    };

    userBans.set(userId, ban);

    // Update user status
    const updatedUser = {
      ...user,
      status: 'banned',
      updatedAt: new Date(),
    };

    users.set(userId, updatedUser);

    return {
      message: `User banned successfully${duration > 0 ? ` for ${duration} days` : ' permanently'}`,
      success: true,
    };
  }

  async unbanUser(userId: string, unbanUserDto: any): Promise<any> {
    const user = users.get(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ban = userBans.get(userId);
    if (!ban) {
      throw new BadRequestException('User is not banned');
    }

    const { reason, notes } = unbanUserDto;

    // Remove ban record
    userBans.delete(userId);

    // Update user status
    const updatedUser = {
      ...user,
      status: 'active',
      updatedAt: new Date(),
    };

    users.set(userId, updatedUser);

    return {
      message: 'User unbanned successfully',
      success: true,
    };
  }

  async updateUserPlan(userId: string, updateUserPlanDto: any): Promise<any> {
    const user = users.get(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { plan, reason, prorate } = updateUserPlanDto;

    // Update user plan
    const updatedUser = {
      ...user,
      plan,
      updatedAt: new Date(),
    };

    users.set(userId, updatedUser);

    return {
      message: `User plan updated to ${plan} successfully`,
      success: true,
    };
  }

  async getSystemMetrics(): Promise<any> {
    const allUsers = Array.from(users.values());
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(user => user.status === 'active').length;
    const newUsers = allUsers.filter(user => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return new Date(user.createdAt) > thirtyDaysAgo;
    }).length;

    // Mock other metrics
    const totalProjects = Math.floor(Math.random() * 5000) + 2000;
    const totalDocumentation = Math.floor(Math.random() * 10000) + 5000;
    const totalStorageUsed = Math.floor(Math.random() * 100000000000) + 50000000000;
    const uptime = Math.floor(Math.random() * 86400) + 3600;
    const memoryUsage = Math.random() * 100;
    const cpuUsage = Math.random() * 100;
    const diskUsage = Math.random() * 100;
    const avgResponseTime = Math.random() * 500 + 50;
    const requestsPerSecond = Math.random() * 200 + 50;
    const errorRate = Math.random() * 5;

    return {
      totalUsers,
      activeUsers,
      newUsers,
      totalProjects,
      totalDocumentation,
      totalStorageUsed,
      uptime,
      memoryUsage,
      cpuUsage,
      diskUsage,
      avgResponseTime,
      requestsPerSecond,
      errorRate,
      lastUpdated: new Date(),
    };
  }

  async getUserAnalytics(period?: string): Promise<any> {
    const analyticsPeriod = period || '30d';
    const allUsers = Array.from(users.values());
    
    const totalUsers = allUsers.length;
    const newUsers = this.getNewUsersInPeriod(analyticsPeriod);
    const activeUsers = this.getActiveUsersInPeriod(analyticsPeriod);
    const growthRate = this.calculateGrowthRate(analyticsPeriod);
    const retentionRate = this.calculateRetentionRate(analyticsPeriod);
    const churnRate = 100 - retentionRate;

    // Plan distribution
    const planDistribution = {
      free: allUsers.filter(user => user.plan === 'free').length,
      pro: allUsers.filter(user => user.plan === 'pro').length,
      enterprise: allUsers.filter(user => user.plan === 'enterprise').length,
    };

    // Daily data
    const dailyData = this.generateDailyUserData(analyticsPeriod);

    // Top countries
    const topCountries = this.generateTopCountries();

    return {
      period: analyticsPeriod,
      totalUsers,
      newUsers,
      activeUsers,
      growthRate,
      retentionRate,
      churnRate,
      planDistribution,
      dailyData,
      topCountries,
    };
  }

  async getUsageAnalytics(period?: string, type?: string): Promise<any> {
    const analyticsPeriod = period || '30d';
    const usageType = type || 'all';

    // Mock usage data
    const totalProjects = Math.floor(Math.random() * 5000) + 2000;
    const totalDocumentation = Math.floor(Math.random() * 10000) + 5000;
    const totalFigmaFiles = Math.floor(Math.random() * 6000) + 3000;
    const totalApiRequests = Math.floor(Math.random() * 200000) + 100000;
    const avgProjectsPerUser = totalProjects / Math.max(Array.from(users.values()).length, 1);
    const avgDocumentationPerProject = totalDocumentation / Math.max(totalProjects, 1);

    // Most used features
    const mostUsedFeatures = [
      { feature: 'API Documentation Generation', usage: 4500, percentage: 52.9 },
      { feature: 'Figma File Analysis', usage: 3200, percentage: 37.6 },
      { feature: 'Project Management', usage: 800, percentage: 9.5 },
    ];

    // Daily trends
    const dailyTrends = this.generateDailyUsageTrends(analyticsPeriod);

    return {
      period: analyticsPeriod,
      type: usageType,
      totalProjects,
      totalDocumentation,
      totalFigmaFiles,
      totalApiRequests,
      avgProjectsPerUser,
      avgDocumentationPerProject,
      mostUsedFeatures,
      dailyTrends,
    };
  }

  async getBillingAnalytics(period?: string): Promise<any> {
    const billingPeriod = period || '3m';

    // Mock billing data
    const totalRevenue = Math.floor(Math.random() * 100000) + 50000;
    const mrr = Math.floor(Math.random() * 30000) + 15000;
    const arr = mrr * 12;
    const revenueGrowth = Math.random() * 50 + 10;
    const arpu = Math.random() * 50 + 20;
    const clv = arpu * 12;

    // Revenue by plan
    const revenueByPlan = {
      free: 0,
      pro: Math.floor(totalRevenue * 0.7),
      enterprise: Math.floor(totalRevenue * 0.3),
    };

    // Monthly trends
    const monthlyTrends = this.generateMonthlyBillingTrends(billingPeriod);

    // Top customers
    const topCustomers = this.generateTopCustomers();

    return {
      period: billingPeriod,
      totalRevenue,
      mrr,
      arr,
      revenueGrowth,
      arpu,
      clv,
      revenueByPlan,
      monthlyTrends,
      topCustomers,
    };
  }

  async getSystemHealth(): Promise<any> {
    return {
      status: 'healthy',
      uptime: Math.floor(Math.random() * 86400) + 3600,
      memoryUsage: Math.random() * 100,
      cpuUsage: Math.random() * 100,
      diskUsage: Math.random() * 100,
      databaseStatus: 'connected',
      redisStatus: 'connected',
      lastCheck: new Date(),
    };
  }

  // Helper methods
  private getUserProjectCount(userId: string): number {
    // Mock project count
    return Math.floor(Math.random() * 10) + 1;
  }

  private getUserTeamMemberCount(userId: string): number {
    // Mock team member count
    return Math.floor(Math.random() * 5) + 1;
  }

  private getUserStorageUsed(userId: string): number {
    // Mock storage usage
    return Math.floor(Math.random() * 100000000) + 1000000;
  }

  private getUserBanReason(userId: string): string | undefined {
    const ban = userBans.get(userId);
    return ban?.reason;
  }

  private getUserBanExpiration(userId: string): Date | undefined {
    const ban = userBans.get(userId);
    return ban?.expiresAt;
  }

  private getNewUsersInPeriod(period: string): number {
    const allUsers = Array.from(users.values());
    const days = this.getDaysFromPeriod(period);
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return allUsers.filter(user => new Date(user.createdAt) > cutoffDate).length;
  }

  private getActiveUsersInPeriod(period: string): number {
    const allUsers = Array.from(users.values());
    const days = this.getDaysFromPeriod(period);
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return allUsers.filter(user => {
      const lastActivity = user.lastLoginAt || user.updatedAt;
      return new Date(lastActivity) > cutoffDate;
    }).length;
  }

  private calculateGrowthRate(period: string): number {
    // Mock growth rate calculation
    return Math.random() * 30 + 5;
  }

  private calculateRetentionRate(period: string): number {
    // Mock retention rate calculation
    return Math.random() * 20 + 75;
  }

  private getDaysFromPeriod(period: string): number {
    switch (period) {
      case '1d': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 30;
    }
  }

  private generateDailyUserData(period: string): any[] {
    const days = this.getDaysFromPeriod(period);
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        registrations: Math.floor(Math.random() * 10) + 1,
        activeUsers: Math.floor(Math.random() * 100) + 50,
      });
    }
    
    return data;
  }

  private generateTopCountries(): any[] {
    const countries = [
      { country: 'United States', users: 450, percentage: 36.0 },
      { country: 'United Kingdom', users: 200, percentage: 16.0 },
      { country: 'Germany', users: 150, percentage: 12.0 },
      { country: 'Canada', users: 120, percentage: 9.6 },
      { country: 'Australia', users: 100, percentage: 8.0 },
    ];
    
    return countries;
  }

  private generateDailyUsageTrends(period: string): any[] {
    const days = this.getDaysFromPeriod(period);
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        projects: Math.floor(Math.random() * 20) + 5,
        documentation: Math.floor(Math.random() * 30) + 10,
        figmaFiles: Math.floor(Math.random() * 15) + 5,
      });
    }
    
    return data;
  }

  private generateMonthlyBillingTrends(period: string): any[] {
    const months = this.getMonthsFromPeriod(period);
    const data = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);
      
      data.push({
        month: monthStr,
        revenue: Math.floor(Math.random() * 20000) + 10000,
        newSubscriptions: Math.floor(Math.random() * 30) + 10,
        cancellations: Math.floor(Math.random() * 10) + 1,
      });
    }
    
    return data;
  }

  private getMonthsFromPeriod(period: string): number {
    switch (period) {
      case '1m': return 1;
      case '3m': return 3;
      case '6m': return 6;
      case '12m': return 12;
      default: return 3;
    }
  }

  private generateTopCustomers(): any[] {
    const customers = [
      {
        userId: uuidv4(),
        name: 'John Doe',
        email: 'john@example.com',
        plan: 'enterprise',
        revenue: 5000.00,
      },
      {
        userId: uuidv4(),
        name: 'Jane Smith',
        email: 'jane@example.com',
        plan: 'pro',
        revenue: 3000.00,
      },
      {
        userId: uuidv4(),
        name: 'Bob Johnson',
        email: 'bob@example.com',
        plan: 'enterprise',
        revenue: 4500.00,
      },
    ];
    
    return customers;
  }

  // Mock data initialization
  initializeMockData() {
    // Create sample users
    const sampleUsers = [
      {
        id: uuidv4(),
        email: 'admin@example.com',
        name: 'Admin User',
        avatarUrl: 'https://example.com/avatar1.jpg',
        status: 'active',
        plan: 'enterprise',
        emailVerified: true,
        lastLoginAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: uuidv4(),
        email: 'user1@example.com',
        name: 'John Doe',
        avatarUrl: 'https://example.com/avatar2.jpg',
        status: 'active',
        plan: 'pro',
        emailVerified: true,
        lastLoginAt: new Date('2024-01-14'),
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-14'),
      },
      {
        id: uuidv4(),
        email: 'user2@example.com',
        name: 'Jane Smith',
        avatarUrl: 'https://example.com/avatar3.jpg',
        status: 'banned',
        plan: 'free',
        emailVerified: false,
        lastLoginAt: new Date('2024-01-10'),
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-12'),
      },
    ];

    sampleUsers.forEach(user => {
      users.set(user.id, user);
    });
  }
} 