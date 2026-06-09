import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserService } from '../services/user.service';
import { UsersController } from './users.controller';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UserService],
})
export class UsersModule {}
