import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthResponse, AuthUser, Login, Signup } from '@shared/dtos';
import { ENV_KEYS, NODE_ENV } from '@shared/constants';
import type { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { MongooseErrorHandler } from '../utils/mongoose-error.handler.util';
import { hashPassword, verifyPassword } from '../utils/password.util';

type TokenPayload = {
  sub: string;
  email: string;
};

type VerifiedPayload = TokenPayload & jwt.JwtPayload;

@Injectable()
export class AuthService {
  private readonly accessTokenSecret =
    process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET] ?? 'dev-access-secret';
  private readonly refreshTokenSecret =
    process.env[ENV_KEYS.AUTH_REFRESH_TOKEN_SECRET] ?? 'dev-refresh-secret';
  private readonly accessTokenTtlSeconds = this.parseTtlSeconds(
    process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_TTL_SECONDS],
    10 * 60,
  );
  private readonly refreshTokenTtlSeconds = this.parseTtlSeconds(
    process.env[ENV_KEYS.AUTH_REFRESH_TOKEN_TTL_SECONDS],
    24 * 60 * 60,
  );
  private readonly accessCookieName =
    process.env[ENV_KEYS.AUTH_ACCESS_COOKIE_NAME] ?? 'qa_access_token';
  private readonly refreshCookieName =
    process.env[ENV_KEYS.AUTH_REFRESH_COOKIE_NAME] ?? 'qa_refresh_token';
  private readonly cookieSameSite = this.parseSameSite(
    process.env[ENV_KEYS.AUTH_COOKIE_SAME_SITE],
  );
  private readonly cookieSecure =
    process.env[ENV_KEYS.NODE_ENV] === NODE_ENV.PRODUCTION;

  constructor(private readonly userRepository: UserRepository) {}

  async register(input: Signup, response: Response): Promise<AuthResponse> {
    if (!input.email) {
      throw new BadRequestException('A valid email is required');
    }

    try {
      const user = await this.userRepository.create({
        email: input.email,
        name: input.name,
        password: input.password,
      });
      await this.issueSession(response, user);
      return { user };
    } catch (error) {
      MongooseErrorHandler.rethrow(
        error,
        'Failed to register user',
        'AuthService.register',
      );
    }
  }

  async login(input: Login, response: Response): Promise<AuthResponse> {
    if (!input.email) {
      throw new BadRequestException('A valid email is required');
    }

    const user = await this.userRepository.findByEmailWithSecrets(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const authUser: AuthUser = {
      _id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    await this.issueSession(response, authUser);
    return { user: authUser };
  }

  async refresh(
    refreshToken: string,
    response: Response,
  ): Promise<AuthResponse> {
    const payload = this.verifyToken(refreshToken, this.refreshTokenSecret);
    const user = await this.userRepository.findByIdWithRefreshToken(
      payload.sub,
    );

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await verifyPassword(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const authUser: AuthUser = {
      _id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    await this.issueSession(response, authUser);
    return { user: authUser };
  }

  clearAuthCookies(response: Response): void {
    response.clearCookie(this.accessCookieName, this.cookieBaseOptions);
    response.clearCookie(this.refreshCookieName, this.cookieBaseOptions);
  }

  getAccessTokenFromRequest(request: Request): string | undefined {
    return request.cookies?.[this.accessCookieName] as string | undefined;
  }

  getRefreshTokenFromRequest(request: Request): string | undefined {
    return request.cookies?.[this.refreshCookieName] as string | undefined;
  }

  verifyAccessToken(token: string): VerifiedPayload {
    return this.verifyToken(token, this.accessTokenSecret);
  }

  private async issueSession(
    response: Response,
    user: AuthUser,
  ): Promise<void> {
    const accessToken = this.signToken(
      user,
      this.accessTokenSecret,
      this.accessTokenTtlSeconds,
    );
    const refreshToken = this.signToken(
      user,
      this.refreshTokenSecret,
      this.refreshTokenTtlSeconds,
    );
    const refreshTokenHash = await hashPassword(refreshToken);

    await this.userRepository.updateRefreshTokenHash(
      user._id,
      refreshTokenHash,
    );

    response.cookie(this.accessCookieName, accessToken, {
      ...this.cookieBaseOptions,
      maxAge: this.accessTokenTtlSeconds * 1000,
    });
    response.cookie(this.refreshCookieName, refreshToken, {
      ...this.cookieBaseOptions,
      maxAge: this.refreshTokenTtlSeconds * 1000,
    });
  }

  private signToken(
    user: AuthUser,
    secret: string,
    expiresInSeconds: number,
  ): string {
    return jwt.sign(
      {
        sub: user._id,
        email: user.email,
      } satisfies TokenPayload,
      secret,
      { expiresIn: expiresInSeconds },
    );
  }

  private verifyToken(token: string, secret: string): VerifiedPayload {
    try {
      const payload = jwt.verify(token, secret);
      if (
        typeof payload !== 'object' ||
        payload === null ||
        !('sub' in payload)
      ) {
        throw new UnauthorizedException('Unauthorized');
      }
      if (typeof payload.sub !== 'string') {
        throw new UnauthorizedException('Unauthorized');
      }

      return payload as VerifiedPayload;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  private parseTtlSeconds(value: string | undefined, fallback: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }
    return Math.floor(parsed);
  }

  private parseSameSite(value: string | undefined): 'lax' | 'strict' | 'none' {
    if (value === 'strict' || value === 'none' || value === 'lax') {
      return value;
    }
    return 'lax';
  }

  private get cookieBaseOptions() {
    return {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: this.cookieSameSite,
      path: '/',
    } as const;
  }
}
