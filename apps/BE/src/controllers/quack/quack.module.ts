import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { QuackController } from './quack.controller';
import { QuackService } from './quack.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [QuackController],
  providers: [QuackService],
})
export class QuackModule {}
