import { Injectable } from '@nestjs/common';
import type { QuackInput, QuackResponse } from '@shared/dtos';
import { UserService } from '../users/user.service';

@Injectable()
export class QuackService {
  constructor(private readonly userService: UserService) {}

  async quack(userId: string, input: QuackInput): Promise<QuackResponse> {
    if (input.name !== undefined) {
      return { quack: `${input.name} quack` };
    }

    const user = await this.userService.getMe(userId);
    return { quack: `${user.name} quack` };
  }
}
