import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user exists and has admin role
    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Insufficient admin permissions');
    }

    return true;
  }
} 