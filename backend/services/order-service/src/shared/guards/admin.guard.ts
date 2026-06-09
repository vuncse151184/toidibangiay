import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<{ user?: { roles: string[] } }>();
    if (!user?.roles?.includes('admin')) {
      throw new ForbiddenException('Yêu cầu quyền admin');
    }
    return true;
  }
}
