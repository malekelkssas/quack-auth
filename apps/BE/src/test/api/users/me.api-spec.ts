import { BE_ROUTES } from '@shared/constants';
import { FIXTURE_USER_PASSWORD } from '@quack/mongoose/fixtures';
import * as jwt from 'jsonwebtoken';
import { TEST_AUTH_ACCESS_SECRET } from '../../helpers/auth-secrets';
import {
  getApiTestApp,
  registerApiTestLifecycle,
} from '../../setup/api-spec-lifecycle';
import { loginFixtureUser, registerUser } from '../../helpers/auth';
import { expectAuthUserShape } from '../../helpers/auth-user';
import { AUTH_COOKIE_NAMES, toCookieHeader } from '../../helpers/cookies';
import { expectApiError } from '../../helpers/expect-error';
import { resetDb } from '../../helpers/db';
import { api, API_PATHS, fullApiPath } from '../../helpers/request';

describe(`GET ${fullApiPath(BE_ROUTES.USERS, BE_ROUTES.ME)}`, () => {
  registerApiTestLifecycle();

  describe('with seeded database', () => {
    beforeEach(async () => {
      await resetDb();
    });

    it.each([
      ['after login', 'login'],
      ['after register', 'register'],
    ] as const)('returns AuthUser %s (200)', async (_label, flow) => {
      const app = getApiTestApp();
      const session =
        flow === 'login'
          ? await loginFixtureUser(app)
          : await registerUser(app, {
              email: 'me-test@example.com',
              name: 'Me Test',
              password: FIXTURE_USER_PASSWORD,
            });

      const response = await api(app)
        .get(API_PATHS.users.me)
        .set('Cookie', toCookieHeader(session.cookies))
        .expect(200);

      expectAuthUserShape(response.body.user, {
        _id: session.user._id as string,
        email: session.user.email as string,
        name: session.user.name as string,
      });
    });

    it('returns 401 without cookies', async () => {
      const response = await api(getApiTestApp())
        .get(API_PATHS.users.me)
        .expect(401);

      expectApiError(response, 'Unauthorized');
    });

    it('returns 401 for tampered access token cookie', async () => {
      const app = getApiTestApp();
      const { cookies } = await loginFixtureUser(app);
      const tamperedAccess = `${cookies[AUTH_COOKIE_NAMES.access]}x`;

      const response = await api(app)
        .get(API_PATHS.users.me)
        .set(
          'Cookie',
          toCookieHeader({
            ...cookies,
            [AUTH_COOKIE_NAMES.access]: tamperedAccess,
          }),
        )
        .expect(401);

      expectApiError(response, 'Unauthorized');
    });

    it('returns 401 for expired access token (signed with negative TTL)', async () => {
      const app = getApiTestApp();
      const { user } = await loginFixtureUser(app);
      const expiredAccessToken = jwt.sign(
        { sub: user._id, email: user.email },
        TEST_AUTH_ACCESS_SECRET,
        { expiresIn: -60 },
      );

      const response = await api(app)
        .get(API_PATHS.users.me)
        .set(
          'Cookie',
          toCookieHeader({
            [AUTH_COOKIE_NAMES.access]: expiredAccessToken,
          }),
        )
        .expect(401);

      expectApiError(response, 'Unauthorized');
    });
  });
});
