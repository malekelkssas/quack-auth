import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthUser } from '@shared/dtos';
import { UserRepository } from '../../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return user;
  }
}
