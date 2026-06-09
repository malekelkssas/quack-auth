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

const seededUser = userFixtures[0];

describe(`POST ${fullApiPath(BE_ROUTES.AUTH, BE_ROUTES.LOGIN)}`, () => {
  registerApiTestLifecycle();

  describe('with seeded database', () => {
    beforeEach(async () => {
      await resetDb();
    });

    it('returns AuthUser and sets auth cookies for valid credentials (200)', async () => {
      const app = getApiTestApp();
      const response = await api(app)
        .post(API_PATHS.auth.login)
        .send({
          email: seededUser.email,
          password: FIXTURE_USER_PASSWORD,
        })
        .expect(200);

      expectAuthUserShape(response.body.user, {
        email: seededUser.email,
        name: seededUser.name,
      });
      expectAuthCookiesSet(response.headers['set-cookie']);
    });

    it('returns 401 with generic message for wrong password', async () => {
      const app = getApiTestApp();
      const response = await api(app)
        .post(API_PATHS.auth.login)
        .send({
          email: seededUser.email,
          password: 'WrongPass1!',
        })
        .expect(401);

      expectApiError(response, 'Invalid email or password');
    });

    it('returns 401 with same generic message for unknown email', async () => {
      const app = getApiTestApp();
      const response = await api(app)
        .post(API_PATHS.auth.login)
        .send({
          email: 'nobody@example.com',
          password: FIXTURE_USER_PASSWORD,
        })
        .expect(401);

      expectApiError(response, 'Invalid email or password');
    });
  });

  describe('validation (400)', () => {
    it.each([
      [
        'missing email',
        { password: FIXTURE_USER_PASSWORD },
        'A valid email is required',
      ],
      ['missing password', { email: seededUser.email }, 'Password is required'],
      [
        'invalid email',
        { email: 'not-an-email', password: FIXTURE_USER_PASSWORD },
        'A valid email is required',
      ],
    ] as const)('rejects %s', async (_label, body, message) => {
      const app = getApiTestApp();
      const response = await api(app)
        .post(API_PATHS.auth.login)
        .send(body)
        .expect(400);

      expectApiError(response, message);
    });
  });
});
