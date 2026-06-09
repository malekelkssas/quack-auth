import { createZodDto } from 'nestjs-zod';
import { AuthResponse } from '@shared/dtos';

export class MeResponseDto extends createZodDto(AuthResponse) {}
