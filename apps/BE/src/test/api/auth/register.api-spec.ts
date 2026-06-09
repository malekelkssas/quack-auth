import { BE_ROUTES } from '@shared/constants';
import { FIXTURE_USER_PASSWORD, userFixtures } from '@quack/mongoose/fixtures';
import {
  getApiTestApp,
  registerApiTestLifecycle,
} from '../../setup/api-spec-lifecycle';
import { expectAuthUserShape } from '../../helpers/auth-user';
import { expectAuthCookiesSet } from '../../helpers/cookies';
import { expectApiError } from '../../helpers/expect-error';
import { resetDb } from '../../helpers/db';
import { api, API_PATHS, fullApiPath } from '../../helpers/request';

const validSignup = (overrides: Record<string, unknown> = {}) => ({
  email: 'new@example.com',
  name: 'New User',
  password: FIXTURE_USER_PASSWORD,
  ...overrides,
});

describe(`POST ${fullApiPath(BE_ROUTES.AUTH, BE_ROUTES.REGISTER)}`, () => {
  registerApiTestLifecycle();

  describe('with seeded database', () => {
    beforeEach(async () => {
      await resetDb();
    });

    it('creates a new user with AuthUser shape and auth cookies (201)', async () => {
      const payload = validSignup();
      const response = await api(getApiTestApp())
        .post(API_PATHS.auth.register)
        .send(payload)
        .expect(201);

      expectAuthUserShape(response.body.user, {
        email: payload.email,
        name: payload.name,
      });
      expectAuthCookiesSet(response.headers['set-cookie']);
    });

    it('returns 409 when email is already seeded', async () => {
      const response = await api(getApiTestApp())
        .post(API_PATHS.auth.register)
        .send(userFixtures[0])
        .expect(409);

      expectApiError(response, 'Email is already registered');
    });
  });

  describe('validation (400)', () => {
    it.each([
      [
        'missing email',
        { name: 'New User', password: FIXTURE_USER_PASSWORD },
        'A valid email is required',
      ],
      [
        'missing name',
        { email: 'new@example.com', password: FIXTURE_USER_PASSWORD },
        'Name is required',
      ],
      [
        'missing password',
        { email: 'new@example.com', name: 'New User' },
        'Password is required',
      ],
      [
        'invalid email',
        {
          email: 'not-an-email',
          name: 'Bad Email',
          password: FIXTURE_USER_PASSWORD,
        },
        'A valid email is required',
      ],
      [
        'name shorter than 3 characters',
        {
          email: 'new@example.com',
          name: 'Ab',
          password: FIXTURE_USER_PASSWORD,
        },
        'Name must be at least 3 characters',
      ],
      [
        'password shorter than 8 characters',
        { email: 'new@example.com', name: 'New User', password: 'Pass1!' },
        'Password must be at least 8 characters',
      ],
      [
        'password without a letter',
        { email: 'new@example.com', name: 'New User', password: '12345678!' },
        'Password must contain at least one letter',
      ],
      [
        'password without a number',
        { email: 'new@example.com', name: 'New User', password: 'Password!!' },
        'Password must contain at least one number',
      ],
      [
        'password without a special character',
        { email: 'new@example.com', name: 'New User', password: 'Password1' },
        'Password must contain at least one special character',
      ],
    ] as const)('rejects %s', async (_label, body, message) => {
      const response = await api(getApiTestApp())
        .post(API_PATHS.auth.register)
        .send(body)
        .expect(400);

      expectApiError(response, message);
    });
  });
});
