import type { INestApplication } from '@nestjs/common';
import mongoose from 'mongoose';
import { BE_ROUTES } from '@shared/constants';
import { FIXTURE_USER_PASSWORD, userFixtures } from '@quack/mongoose/fixtures';
import { createTestApp } from '../../setup/create-test-app';
import { expectApiError } from '../../helpers/expect-error';
import { resetDb } from '../../helpers/db';
import { api, API_PATHS, fullApiPath } from '../../helpers/request';

describe(`POST ${fullApiPath(BE_ROUTES.USERS, BE_ROUTES.SIGNUP)}`, () => {
  let app: INestApplication;

  beforeEach(async () => {
    ({ app } = await createTestApp());
    await resetDb();
  });

  afterEach(async () => {
    await app.close();
    await mongoose.disconnect();
  });

  it('creates a new user (201)', async () => {
    await api(app)
      .post(API_PATHS.users.signup)
      .send({
        email: 'new@example.com',
        name: 'New User',
        password: FIXTURE_USER_PASSWORD,
      })
      .expect(201);
  });

  it('returns 409 when email is already seeded', async () => {
    const response = await api(app)
      .post(API_PATHS.users.signup)
      .send(userFixtures[0])
      .expect(409);

    expectApiError(response, 409, 'Email is already registered');
  });

  describe('validation (400)', () => {
    it('rejects missing email', async () => {
      const response = await api(app)
        .post(API_PATHS.users.signup)
        .send({
          name: 'New User',
          password: FIXTURE_USER_PASSWORD,
        })
        .expect(400);

      expectApiError(response, 400, 'A valid email is required');
    });

    it('rejects missing name', async () => {
      const response = await api(app)
        .post(API_PATHS.users.signup)
        .send({
          email: 'new@example.com',
          password: FIXTURE_USER_PASSWORD,
        })
        .expect(400);

      expectApiError(response, 400, 'Name is required');
    });

    it('rejects missing password', async () => {
      const response = await api(app)
        .post(API_PATHS.users.signup)
        .send({
          email: 'new@example.com',
          name: 'New User',
        })
        .expect(400);

      expectApiError(response, 400, 'Password is required');
    });

    it('rejects invalid email', async () => {
      const response = await api(app)
        .post(API_PATHS.users.signup)
        .send({
          email: 'not-an-email',
          name: 'Bad Email',
          password: FIXTURE_USER_PASSWORD,
        })
        .expect(400);

      expectApiError(response, 400, 'A valid email is required');
    });

    it('rejects name shorter than 3 characters', async () => {
      const response = await api(app)
        .post(API_PATHS.users.signup)
        .send({
          email: 'new@example.com',
          name: 'Ab',
          password: FIXTURE_USER_PASSWORD,
        })
        .expect(400);

      expectApiError(response, 400, 'Name must be at least 3 characters');
    });

    it('rejects password shorter than 8 characters', async () => {
      const response = await api(app)
        .post(API_PATHS.users.signup)
        .send({
          email: 'new@example.com',
          name: 'New User',
          password: 'Pass1!',
        })
        .expect(400);

      expectApiError(response, 400, 'Password must be at least 8 characters');
    });

    it('rejects password without a letter', async () => {
      const response = await api(app)
        .post(API_PATHS.users.signup)
        .send({
          email: 'new@example.com',
          name: 'New User',
          password: '12345678!',
        })
        .expect(400);

      expectApiError(
        response,
        400,
        'Password must contain at least one letter',
      );
    });

    it('rejects password without a number', async () => {
      const response = await api(app)
        .post(API_PATHS.users.signup)
        .send({
          email: 'new@example.com',
          name: 'New User',
          password: 'Password!!',
        })
        .expect(400);

      expectApiError(
        response,
        400,
        'Password must contain at least one number',
      );
    });

    it('rejects password without a special character', async () => {
      const response = await api(app)
        .post(API_PATHS.users.signup)
        .send({
          email: 'new@example.com',
          name: 'New User',
          password: 'Password1',
        })
        .expect(400);

      expectApiError(
        response,
        400,
        'Password must contain at least one special character',
      );
    });
  });
});
