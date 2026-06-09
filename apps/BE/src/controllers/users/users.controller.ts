import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BE_ROUTES } from '@shared/constants';
import { ZodResponse } from 'nestjs-zod';
import { OPENAPI_ACCESS_COOKIE } from '../../config/openapi.config';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { JwtCookieAuthGuard } from '../../decorators/jwt-cookie-auth.guard';
import { UserService } from './user.service';
import { MeResponseDto } from './users.dto';

@ApiTags('users')
@Controller(BE_ROUTES.USERS)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get(BE_ROUTES.ME)
  @UseGuards(JwtCookieAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Return the authenticated user profile' })
  @ApiSecurity(OPENAPI_ACCESS_COOKIE)
  @ApiOkResponse({ type: MeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access cookie' })
  @ZodResponse({ type: MeResponseDto })
  async me(@CurrentUser() userId: string) {
    const user = await this.userService.getMe(userId);
    return { user };
  }
}
