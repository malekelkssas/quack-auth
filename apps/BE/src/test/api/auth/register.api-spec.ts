import { BE_ROUTES } from '@shared/constants';
import { FIXTURE_USER_PASSWORD, userFixtures } from '@quack/mongoose/fixtures';
import {
  getApiTestApp,
  registerApiTestLifecycle,
} from '../../setup/api-spec-lifecycle';
import { expectAuthUserShape } from '../../helpers/auth-user';
import { expectAuthCookiesSet } from '../../helpers/cookies';
import { fetchCsrf, withCsrf } from '../../helpers/csrf';
import { expectApiError } from '../../helpers/expect-error';
import { resetDb } from '../../helpers/db';
import { SIGNUP_VALIDATION_CASES } from '../../fixtures/signup-validation.cases';
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
      const app = getApiTestApp();
      const payload = validSignup();
      const csrf = await fetchCsrf(app);
      const response = await withCsrf(
        api(app).post(API_PATHS.auth.register),
        csrf,
      )
        .send(payload)
        .expect(201);

      expectAuthUserShape(response.body.user, {
        email: payload.email,
        name: payload.name,
      });
      expectAuthCookiesSet(response.headers['set-cookie']);
    });

    it('returns 409 when email is already seeded', async () => {
      const app = getApiTestApp();
      const csrf = await fetchCsrf(app);
      const response = await withCsrf(
        api(app).post(API_PATHS.auth.register),
        csrf,
      )
        .send(userFixtures[0])
        .expect(409);

      expectApiError(response, 'Email is already registered');
    });

    it('returns 403 when CSRF token is missing', async () => {
      const response = await api(getApiTestApp())
        .post(API_PATHS.auth.register)
        .send(validSignup())
        .expect(403);

      expectApiError(response, 'invalid csrf token');
    });
  });

  describe('validation (400)', () => {
    it.each(SIGNUP_VALIDATION_CASES)(
      'rejects %s',
      async (_label, body, message) => {
        const app = getApiTestApp();
        const csrf = await fetchCsrf(app);
        const response = await withCsrf(
          api(app).post(API_PATHS.auth.register),
          csrf,
        )
          .send(body)
          .expect(400);

        expectApiError(response, message);
      },
    );
  });
});
