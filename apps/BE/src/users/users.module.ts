import { Module } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from '../services/user.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UserRepository, UserService],
})
export class UsersModule {}
