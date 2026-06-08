import { createZodDto } from 'nestjs-zod';
import {
  GreetingQuery,
  GreetingResponse,
} from '@shared/dtos';

export class GreetingQueryDto extends createZodDto(GreetingQuery) {}

export class GreetingResponseDto extends createZodDto(GreetingResponse) {}
