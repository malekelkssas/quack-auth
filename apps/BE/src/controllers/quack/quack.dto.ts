import { createZodDto } from 'nestjs-zod';
import { QuackInput, QuackResponse } from '@shared/dtos';

export class QuackInputDto extends createZodDto(QuackInput) {}
export class QuackResponseDto extends createZodDto(QuackResponse) {}
