import type { INestApplication } from '@nestjs/common';
import mongoose from 'mongoose';
import { API_ERROR_CODES, BE_ROUTES, ENV_KEYS } from '@shared/constants';
import { createTestApp } from '../../setup/create-test-app';
import { expectApiError } from '../../helpers/expect-error';
import { api, API_PATHS, fullApiPath } from '../../helpers/request';

/** Small limit so a normal signup payload exceeds BE_JSON_BODY_LIMIT. */
const LOW_JSON_BODY_LIMIT = '50b';

describe(`JSON body size limit ${fullApiPath(BE_ROUTES.AUTH, BE_ROUTES.REGISTER)}`, () => {
  let testApp: INestApplication;

  beforeAll(async () => {
    process.env[ENV_KEYS.BE_JSON_BODY_LIMIT] = LOW_JSON_BODY_LIMIT;
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp.close();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('returns 413 ErrorResponse when JSON body exceeds BE_JSON_BODY_LIMIT', async () => {
    const app = testApp;
    const response = await api(app)
      .post(API_PATHS.auth.register)
      .send({
        email: 'body-limit@example.com',
        name: 'Body Limit User',
        password: 'ValidPass1!',
      })
      .expect(413);

    expectApiError(
      response,
      'Request body too large',
      API_ERROR_CODES.PAYLOAD_TOO_LARGE,
    );
  });
});
