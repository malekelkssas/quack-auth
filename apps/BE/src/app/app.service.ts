import { Injectable } from '@nestjs/common';
import { APP_NAME } from '@shared/constants';
import { GreetingResponse, GreetingQuery } from '@shared/dtos';

@Injectable()
export class AppService {
  getGreeting(query: GreetingQuery): GreetingResponse {
    return { name: query.name, appName: APP_NAME};
  }
}
