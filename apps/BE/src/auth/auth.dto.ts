import { createZodDto } from 'nestjs-zod';
import { AuthResponse, Login, Signup } from '@shared/dtos';

export class RegisterDto extends createZodDto(Signup) {}
export class LoginDto extends createZodDto(Login) {}
export class AuthResponseDto extends createZodDto(AuthResponse) {}
