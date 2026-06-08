import { createZodDto } from 'nestjs-zod';
import { Signup } from '@shared/dtos';

export class SignupDto extends createZodDto(Signup) {}
