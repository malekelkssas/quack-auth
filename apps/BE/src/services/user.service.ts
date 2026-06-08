import { ConflictException, Injectable } from '@nestjs/common';
import type { Signup } from '@shared/dtos';
import { UserRepository } from '../repositories/user.repository';
import { MongooseErrorHandler } from '../utils/mongoose-error.handler.util';
import { hashPassword } from '../utils/password.util';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async signup(input: Signup): Promise<void> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await hashPassword(input.password);

    try {
      await this.userRepository.create({
        email: input.email,
        name: input.name,
        password: passwordHash,
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
