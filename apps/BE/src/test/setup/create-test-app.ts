import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import mongoose from 'mongoose';
import { dbClient } from '@quack/mongoose/client';
import { AppModule } from '../../app/app.module';
import { configureApp } from '../../app/configure-app';

export interface TestAppContext {
  app: INestApplication;
}

export async function createTestApp(): Promise<TestAppContext> {
  if (mongoose.connection.readyState === 0) {
    await dbClient();
  }

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();

  return { app };
}
