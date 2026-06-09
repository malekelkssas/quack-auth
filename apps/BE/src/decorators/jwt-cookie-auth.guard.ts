import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../controllers/auth/auth.service';

export type AuthenticatedRequest = Request & { user?: { sub: string } };

@Injectable()
export class JwtCookieAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.authService.getAccessTokenFromRequest(request);
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    const payload = this.authService.verifyAccessToken(token);
    request.user = { sub: payload.sub };
    return true;
  }
}
