import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Login, Signup } from '@shared/dtos';
import { BE_ROUTES } from '@shared/constants';
import type { Request, Response } from 'express';
import { ZodResponse } from 'nestjs-zod';
import { AuthResponseDto, LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';

@UseGuards(ThrottlerGuard)
@Controller(BE_ROUTES.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(BE_ROUTES.REGISTER)
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({ type: AuthResponseDto })
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(body as Signup, response);
  }

  @Post(BE_ROUTES.LOGIN)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: AuthResponseDto })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(body as Login, response);
  }

  @Post(BE_ROUTES.REFRESH)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: AuthResponseDto })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = this.authService.getRefreshTokenFromRequest(request);
    if (!refreshToken) {
      this.authService.clearAuthCookies(response);
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      return await this.authService.refresh(refreshToken, response);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.authService.clearAuthCookies(response);
      }
      throw error;
    }
  }

  @Post(BE_ROUTES.LOGOUT)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(request, response);
  }
}
