import type { INestApplication } from '@nestjs/common';
import mongoose from 'mongoose';
import { API_ERROR_CODES, BE_ROUTES, ENV_KEYS } from '@shared/constants';
import { FIXTURE_USER_PASSWORD } from '@quack/mongoose/fixtures';
import { createTestApp } from '../../setup/create-test-app';
import { expectApiError } from '../../helpers/expect-error';
import { api, API_PATHS, fullApiPath } from '../../helpers/request';

const LOW_AUTH_THROTTLE_LIMIT = 2;

describe(`Auth rate limit ${fullApiPath(BE_ROUTES.AUTH, '*')}`, () => {
  let testApp: INestApplication;
  let previousThrottleLimit: string | undefined;

  beforeAll(async () => {
    previousThrottleLimit = process.env[ENV_KEYS.AUTH_THROTTLE_LIMIT];
    process.env[ENV_KEYS.AUTH_THROTTLE_LIMIT] = String(LOW_AUTH_THROTTLE_LIMIT);
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp.close();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (previousThrottleLimit === undefined) {
      delete process.env[ENV_KEYS.AUTH_THROTTLE_LIMIT];
    } else {
      process.env[ENV_KEYS.AUTH_THROTTLE_LIMIT] = previousThrottleLimit;
    }
  });

  it('returns 429 when auth POST burst exceeds AUTH_THROTTLE_LIMIT', async () => {
    const app = testApp;
    const loginBody = {
      email: 'throttle-test@example.com',
      password: FIXTURE_USER_PASSWORD,
    };

    for (let i = 0; i < LOW_AUTH_THROTTLE_LIMIT; i++) {
      await api(app).post(API_PATHS.auth.login).send(loginBody).expect(401);
    }

    const response = await api(app)
      .post(API_PATHS.auth.login)
      .send(loginBody)
      .expect(429);

    expectApiError(
      response,
      'Too many requests',
      API_ERROR_CODES.TOO_MANY_REQUESTS,
    );
  });
});
