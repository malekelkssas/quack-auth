import type { INestApplication } from '@nestjs/common';
import mongoose from 'mongoose';
import { APP_NAME } from '@shared/constants';
import { createTestApp } from '../setup/create-test-app';
import { resetDb } from '../helpers/db';
import { api, API_PATHS, fullApiPath } from '../helpers/request';

describe(`GET ${fullApiPath()}`, () => {
  let app: INestApplication;

  beforeEach(async () => {
    ({ app } = await createTestApp());
    await resetDb();
  });

  afterEach(async () => {
    await app.close();
    await mongoose.disconnect();
  });

  it('returns greeting with app name', async () => {
    const response = await api(app)
      .get(`${API_PATHS.root}?name=Quack`)
      .expect(200);

    expect(response.body).toEqual({
      name: 'Quack',
      appName: APP_NAME,
    });
  });
});
