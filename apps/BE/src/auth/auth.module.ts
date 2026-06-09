import { Module } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtCookieAuthGuard } from './jwt-cookie-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtCookieAuthGuard],
  exports: [AuthService, JwtCookieAuthGuard],
})
export class AuthModule {}
