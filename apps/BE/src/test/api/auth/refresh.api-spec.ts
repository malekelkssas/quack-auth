import { BE_ROUTES } from '@shared/constants';
import {
  getApiTestApp,
  registerApiTestLifecycle,
} from '../../setup/api-spec-lifecycle';
import { loginFixtureUser } from '../../helpers/auth';
import { expectAuthUserShape } from '../../helpers/auth-user';
import {
  AUTH_COOKIE_NAMES,
  expectAuthCookiesCleared,
  expectAuthCookiesSet,
  toCookieHeader,
} from '../../helpers/cookies';
import { expectApiError } from '../../helpers/expect-error';
import { resetDb } from '../../helpers/db';
import { api, API_PATHS, fullApiPath } from '../../helpers/request';

/** JWT `iat` is second-granular — wait so refresh issues distinct tokens. */
const waitForNextJwtSecond = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 1100);
  });

describe(`POST ${fullApiPath(BE_ROUTES.AUTH, BE_ROUTES.REFRESH)}`, () => {
  registerApiTestLifecycle();

  describe('with seeded database', () => {
    beforeEach(async () => {
      await resetDb();
    });

    it('rotates tokens and issues new auth cookies (200)', async () => {
      const app = getApiTestApp();
      const { cookies: loginCookies, user } = await loginFixtureUser(app);

      await waitForNextJwtSecond();

      const response = await api(app)
        .post(API_PATHS.auth.refresh)
        .set('Cookie', toCookieHeader(loginCookies))
        .expect(200);

      expectAuthUserShape(response.body.user, {
        _id: user._id as string,
        email: user.email as string,
      });

      const rotatedCookies = expectAuthCookiesSet(
        response.headers['set-cookie'],
      );
      expect(rotatedCookies[AUTH_COOKIE_NAMES.access]).not.toBe(
        loginCookies[AUTH_COOKIE_NAMES.access],
      );
      expect(rotatedCookies[AUTH_COOKIE_NAMES.refresh]).not.toBe(
        loginCookies[AUTH_COOKIE_NAMES.refresh],
      );
    });

    it('returns 401 and clears cookies when refresh cookie is missing', async () => {
      const response = await api(getApiTestApp())
        .post(API_PATHS.auth.refresh)
        .expect(401);

      expectApiError(response, 'Unauthorized');
      expectAuthCookiesCleared(response.headers['set-cookie']);
    });

    it('returns 401 and clears cookies for tampered refresh token', async () => {
      const app = getApiTestApp();
      const { cookies } = await loginFixtureUser(app);
      const tamperedRefresh = `${cookies[AUTH_COOKIE_NAMES.refresh]}tampered`;

      const response = await api(app)
        .post(API_PATHS.auth.refresh)
        .set(
          'Cookie',
          toCookieHeader({
            ...cookies,
            [AUTH_COOKIE_NAMES.refresh]: tamperedRefresh,
          }),
        )
        .expect(401);

      expectApiError(response, 'Unauthorized');
      expectAuthCookiesCleared(response.headers['set-cookie']);
    });

    it('returns 401 when reusing a refresh token after rotation', async () => {
      const app = getApiTestApp();
      const { cookies: originalCookies } = await loginFixtureUser(app);

      await waitForNextJwtSecond();

      await api(app)
        .post(API_PATHS.auth.refresh)
        .set('Cookie', toCookieHeader(originalCookies))
        .expect(200);

      const response = await api(app)
        .post(API_PATHS.auth.refresh)
        .set('Cookie', toCookieHeader(originalCookies))
        .expect(401);

      expectApiError(response, 'Invalid refresh token');
      expectAuthCookiesCleared(response.headers['set-cookie']);
    });
  });
});
