import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// Mock data (replace with Prisma in production)
const users = new Map();
const teamMemberships = new Map();

@Injectable()
export class UsersService {
  async findById(userId: string): Promise<any> {
    const user = Array.from(users.values()).find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      plan: user.plan || 'free',
      emailVerified: user.emailVerified || false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: string, updateProfileDto: any): Promise<any> {
    const user = Array.from(users.values()).find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = users.get(updateProfileDto.email);
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Email is already taken');
      }
    }

    // Update user
    const updatedUser = {
      ...user,
      ...updateProfileDto,
      updatedAt: new Date(),
    };

    users.set(updatedUser.email, updatedUser);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatarUrl: updatedUser.avatarUrl,
      bio: updatedUser.bio,
      plan: updatedUser.plan || 'free',
      emailVerified: updatedUser.emailVerified || false,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async getTeamMembers(userId: string, paginationDto: any): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto;
    
    // Get team members for the user
    const userTeamMembers = Array.from(teamMemberships.values())
      .filter(membership => membership.teamOwnerId === userId)
      .map(membership => {
        const member = Array.from(users.values()).find(u => u.id === membership.memberId);
        return {
          id: member.id,
          email: member.email,
          name: member.name,
          avatarUrl: member.avatarUrl,
          role: membership.role,
          plan: member.plan || 'free',
          emailVerified: member.emailVerified || false,
          joinedAt: membership.joinedAt,
          lastActiveAt: member.lastActiveAt || member.updatedAt,
        };
      });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMembers = userTeamMembers.slice(startIndex, endIndex);

    return {
      data: paginatedMembers,
      pagination: {
        page,
        limit,
        total: userTeamMembers.length,
        pages: Math.ceil(userTeamMembers.length / limit),
      },
    };
  }

  async inviteTeamMember(userId: string, inviteTeamMemberDto: any): Promise<any> {
    const { email, role, message } = inviteTeamMemberDto;

    // Check if user is trying to invite themselves
    const currentUser = Array.from(users.values()).find(u => u.id === userId);
    if (currentUser.email === email) {
      throw new BadRequestException('You cannot invite yourself to the team');
    }

    // Check if user already exists
    let invitedUser = users.get(email);
    if (!invitedUser) {
      // Create a placeholder user (in real app, this would trigger an email invitation)
      invitedUser = {
        id: uuidv4(),
        email: email.toLowerCase().trim(),
        name: email.split('@')[0], // Use email prefix as name
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false,
        plan: 'free',
      };
      users.set(email, invitedUser);
    }

    // Check if user is already a team member
    const existingMembership = Array.from(teamMemberships.values())
      .find(membership => 
        membership.teamOwnerId === userId && 
        membership.memberId === invitedUser.id
      );

    if (existingMembership) {
      throw new BadRequestException('User is already a team member');
    }

    // Create team membership
    const membership = {
      id: uuidv4(),
      teamOwnerId: userId,
      memberId: invitedUser.id,
      role: role,
      joinedAt: new Date(),
      invitedAt: new Date(),
      message: message,
    };

    teamMemberships.set(membership.id, membership);

    // In a real application, send email invitation here
    console.log(`Team invitation sent to ${email} with role ${role}`);

    return {
      message: `Invitation sent successfully to ${email}`,
      success: true,
    };
  }

  async removeTeamMember(userId: string, teamMemberId: string): Promise<any> {
    // Find the team membership
    const membership = Array.from(teamMemberships.values())
      .find(m => 
        m.teamOwnerId === userId && 
        m.memberId === teamMemberId
      );

    if (!membership) {
      throw new NotFoundException('Team member not found');
    }

    // Check if user is trying to remove themselves
    if (userId === teamMemberId) {
      throw new BadRequestException('You cannot remove yourself from the team');
    }

    // Remove the membership
    teamMemberships.delete(membership.id);

    return {
      message: 'Team member removed successfully',
      success: true,
    };
  }

  async getTeamMember(userId: string, teamMemberId: string): Promise<any> {
    // Find the team membership
    const membership = Array.from(teamMemberships.values())
      .find(m => 
        m.teamOwnerId === userId && 
        m.memberId === teamMemberId
      );

    if (!membership) {
      throw new NotFoundException('Team member not found');
    }

    // Get member details
    const member = Array.from(users.values()).find(u => u.id === teamMemberId);
    if (!member) {
      throw new NotFoundException('User not found');
    }

    return {
      id: member.id,
      email: member.email,
      name: member.name,
      avatarUrl: member.avatarUrl,
      role: membership.role,
      plan: member.plan || 'free',
      emailVerified: member.emailVerified || false,
      joinedAt: membership.joinedAt,
      lastActiveAt: member.lastActiveAt || member.updatedAt,
    };
  }

  async getUserStats(userId: string): Promise<any> {
    const user = Array.from(users.values()).find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get team member count
    const teamMemberCount = Array.from(teamMemberships.values())
      .filter(membership => membership.teamOwnerId === userId).length;

    // Get project count (mock data)
    const projectCount = 5; // In real app, query from projects table

    return {
      userId: user.id,
      teamMemberCount,
      projectCount,
      plan: user.plan || 'free',
      emailVerified: user.emailVerified || false,
      joinedAt: user.createdAt,
      lastActiveAt: user.updatedAt,
    };
  }
} 