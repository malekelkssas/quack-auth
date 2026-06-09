import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserService } from '../services/user.service';
import { QuackController } from './quack.controller';
import { QuackService } from './quack.service';

@Module({
  imports: [AuthModule],
  controllers: [QuackController],
  providers: [QuackService, UserService],
})
export class QuackModule {}
