import { Controller, Get, Query } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import { AppService } from './app.service';
import { GreetingQueryDto, GreetingResponseDto } from './app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ZodResponse({ type: GreetingResponseDto })
  getGreeting(@Query() query: GreetingQueryDto) {
    return this.appService.getGreeting(query);
  }
}
