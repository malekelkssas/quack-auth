import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BE_ROUTES } from '@shared/constants';
import { ZodResponse } from 'nestjs-zod';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtCookieAuthGuard } from '../auth/jwt-cookie-auth.guard';
import { UserService } from '../services/user.service';
import { MeResponseDto } from './users.dto';

@Controller(BE_ROUTES.USERS)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get(BE_ROUTES.ME)
  @UseGuards(JwtCookieAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: MeResponseDto })
  async me(@CurrentUser() userId: string) {
    const user = await this.userService.getMe(userId);
    return { user };
  }
}
