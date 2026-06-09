import { Module } from '@nestjs/common';
import { JwtCookieAuthGuard } from '../../decorators/jwt-cookie-auth.guard';
import { UserRepository } from '../../repositories/user.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtCookieAuthGuard],
  exports: [AuthService, JwtCookieAuthGuard, UserRepository],
})
export class AuthModule {}
