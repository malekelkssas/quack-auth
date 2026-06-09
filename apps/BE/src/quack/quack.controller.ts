import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { QuackInput } from '@shared/dtos';
import { BE_ROUTES } from '@shared/constants';
import { ZodResponse } from 'nestjs-zod';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtCookieAuthGuard } from '../auth/jwt-cookie-auth.guard';
import { QuackInputDto, QuackResponseDto } from './quack.dto';
import { QuackService } from './quack.service';

@Controller(BE_ROUTES.QUACK)
export class QuackController {
  constructor(private readonly quackService: QuackService) {}

  @Post()
  @UseGuards(JwtCookieAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: QuackResponseDto })
  async quack(@CurrentUser() userId: string, @Body() body: QuackInputDto) {
    return this.quackService.quack(userId, body as QuackInput);
  }
}
