import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { QuackInput } from '@shared/dtos';
import { BE_ROUTES } from '@shared/constants';
import { ZodResponse } from 'nestjs-zod';
import {
  OPENAPI_ACCESS_COOKIE,
  OPENAPI_CSRF_HEADER,
} from '../../config/openapi.config';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { JwtCookieAuthGuard } from '../../decorators/jwt-cookie-auth.guard';
import { QuackInputDto, QuackResponseDto } from './quack.dto';
import { QuackService } from './quack.service';

@ApiTags('quack')
@Controller(BE_ROUTES.QUACK)
export class QuackController {
  constructor(private readonly quackService: QuackService) {}

  @Post()
  @UseGuards(JwtCookieAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticated quack greeting (requires access cookie + CSRF)',
  })
  @ApiSecurity(OPENAPI_ACCESS_COOKIE)
  @ApiSecurity(OPENAPI_CSRF_HEADER)
  @ApiOkResponse({ type: QuackResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access cookie' })
  @ApiForbiddenResponse({ description: 'Invalid or missing CSRF token' })
  @ZodResponse({ type: QuackResponseDto })
  async quack(@CurrentUser() userId: string, @Body() body: QuackInputDto) {
    return this.quackService.quack(userId, body as QuackInput);
  }
}
