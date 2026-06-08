import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { BE_ROUTES } from '@shared/constants';
import { UserService } from '../services/user.service';
import { SignupDto } from './users.dto';

@Controller(BE_ROUTES.USERS)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post(BE_ROUTES.SIGNUP)
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() body: SignupDto): Promise<void> {
    await this.userService.signup(body);
  }
}
