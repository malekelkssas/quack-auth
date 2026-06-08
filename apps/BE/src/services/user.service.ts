import { Injectable } from '@nestjs/common';
import type { Signup } from '@shared/dtos';
import { UserRepository } from '../repositories/user.repository';
import { MongooseErrorHandler } from '../utils/mongoose-error.handler.util';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async signup(input: Signup): Promise<void> {
    try {
      await this.userRepository.create({
        email: input.email,
        name: input.name,
        password: input.password,
      });
    } catch (error) {
      MongooseErrorHandler.rethrow(
        error,
        'Failed to create user',
        'UserService.signup',
      );
    }
  }
}
