import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Mock user data (replace with Prisma in production)
const users = new Map();

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: any): Promise<any> {
    const { email, password, name } = registerDto;

    // Check if user already exists
    if (users.has(email)) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = {
      id: uuidv4(),
      email: email.toLowerCase().trim(),
      name: name.trim(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      isEmailVerified: false,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    };

    users.set(email, user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async login(loginDto: any): Promise<any> {
    const { email, password } = loginDto;

    // Find user
    const user = users.get(email.toLowerCase().trim());
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async logout(userId: string): Promise<any> {
    // In a real application, you would add the token to a blacklist
    // For now, we'll just return a success message
    return {
      message: 'Successfully logged out',
      success: true,
    };
  }

  async forgotPassword(forgotPasswordDto: any): Promise<any> {
    const { email } = forgotPasswordDto;

    // Find user
    const user = users.get(email.toLowerCase().trim());
    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        message: 'If an account with that email exists, a password reset link has been sent',
        success: true,
      };
    }

    // Generate reset token
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password-reset' },
      { 
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '15m' // 15 minutes
      }
    );

    // Store reset token in user (in production, store in database)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    users.set(user.email, user);

    // In production, send email here
    console.log(`Password reset link: ${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`);

    return {
      message: 'If an account with that email exists, a password reset link has been sent',
      success: true,
    };
  }

  async resetPassword(resetPasswordDto: any): Promise<any> {
    const { token, password, confirmPassword } = resetPasswordDto;

    // Check if passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    try {
      // Verify token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Find user
      const user = Array.from(users.values()).find(u => u.id === payload.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if token is expired
      if (user.resetPasswordExpires < new Date()) {
        throw new BadRequestException('Reset token has expired');
      }

      // Check if token matches
      if (user.resetPasswordToken !== token) {
        throw new BadRequestException('Invalid reset token');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Update user
      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      user.updatedAt = new Date();
      users.set(user.email, user);

      return {
        message: 'Password has been reset successfully',
        success: true,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Reset token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid reset token');
      }
      throw error;
    }
  }

  async changePassword(userId: string, changePasswordDto: any): Promise<any> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    // Find user
    const user = Array.from(users.values()).find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user
    user.password = hashedPassword;
    user.updatedAt = new Date();
    users.set(user.email, user);

    return {
      message: 'Password changed successfully',
      success: true,
    };
  }

  async refreshToken(refreshTokenDto: any): Promise<any> {
    const { refresh_token } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refresh_token, {
        secret: this.configService.get('JWT_REFRESH_SECRET') || this.configService.get('JWT_SECRET'),
      });

      // Find user
      const user = Array.from(users.values()).find(u => u.id === payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw error;
    }
  }

  async validateUser(userId: string): Promise<any> {
    const user = Array.from(users.values()).find(u => u.id === userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // New methods for LocalStrategy
  async findUserByEmail(email: string): Promise<any> {
    return users.get(email.toLowerCase().trim());
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private async generateTokens(user: any): Promise<any> {
    const payload = { 
      sub: user.id, 
      email: user.email 
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET') || this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600, // 1 hour in seconds
    };
  }
} 