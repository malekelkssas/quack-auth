import { Injectable } from '@nestjs/common';
import type { QuackInput, QuackResponse } from '@shared/dtos';
import { UserService } from '../services/user.service';

@Injectable()
export class QuackService {
  constructor(private readonly userService: UserService) {}

  async quack(userId: string, input: QuackInput): Promise<QuackResponse> {
    const user = await this.userService.getMe(userId);
    const name = input.name ?? user.name;
    return { quack: `${name} quack` };
  }
}
