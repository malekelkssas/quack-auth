import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from '../services/user.service';
import { UsersController } from './users.controller';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UserRepository, UserService],
})
export class UsersModule {}
