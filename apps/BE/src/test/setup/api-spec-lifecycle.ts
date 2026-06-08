import type { INestApplication } from '@nestjs/common';
import mongoose from 'mongoose';
import { createTestApp } from './create-test-app';

let testApp: INestApplication;

/** One Nest app + one Mongoose connection per spec file. */
export function registerApiTestLifecycle(): void {
  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp.close();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
}

export function getApiTestApp(): INestApplication {
  return testApp;
}
