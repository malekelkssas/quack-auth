import { BE_ROUTES } from '@shared/constants';
import { UserModel, UserPaths } from '@quack/mongoose/models/user';
import {
  getApiTestApp,
  registerApiTestLifecycle,
} from '../../setup/api-spec-lifecycle';
import { loginFixtureUser } from '../../helpers/auth';
import {
  AUTH_COOKIE_NAMES,
  expectAuthCookiesCleared,
} from '../../helpers/cookies';
import { fetchCsrf, withCsrf } from '../../helpers/csrf';
import { expectApiError } from '../../helpers/expect-error';
import { resetDb } from '../../helpers/db';
import { api, API_PATHS, fullApiPath } from '../../helpers/request';

async function getRefreshTokenHash(
  userId: string,
): Promise<string | undefined> {
  const user = await UserModel.findById(userId)
    .select(`+${UserPaths.refreshTokenHash}`)
    .exec();

  return user?.[UserPaths.refreshTokenHash];
}

describe(`POST ${fullApiPath(BE_ROUTES.AUTH, BE_ROUTES.LOGOUT)}`, () => {
  registerApiTestLifecycle();

  describe('with seeded database', () => {
    beforeEach(async () => {
      await resetDb();
    });

    it('returns 204, clears cookies, and revokes refresh after login', async () => {
      const app = getApiTestApp();
      const { cookies, user } = await loginFixtureUser(app);
      const csrf = await fetchCsrf(app);

      expect(await getRefreshTokenHash(user._id)).toBeTruthy();

      const logoutResponse = await withCsrf(
        api(app).post(API_PATHS.auth.logout),
        csrf,
        cookies,
      ).expect(204);

      expect(logoutResponse.body).toEqual({});
      expectAuthCookiesCleared(logoutResponse.headers['set-cookie']);
      expect(await getRefreshTokenHash(user._id)).toBeUndefined();

      const refreshCsrf = await fetchCsrf(app);
      const refreshResponse = await withCsrf(
        api(app).post(API_PATHS.auth.refresh),
        refreshCsrf,
        cookies,
      ).expect(401);

      expectApiError(refreshResponse, 'Invalid refresh token');
      expectAuthCookiesCleared(refreshResponse.headers['set-cookie']);
    });

    it('returns 204 when no cookies are present', async () => {
      const app = getApiTestApp();
      const csrf = await fetchCsrf(app);
      const response = await withCsrf(
        api(app).post(API_PATHS.auth.logout),
        csrf,
      ).expect(204);

      expect(response.body).toEqual({});
      expectAuthCookiesCleared(response.headers['set-cookie']);
    });

    it('returns 204 and clears cookies when access token is invalid', async () => {
      const app = getApiTestApp();
      const { cookies } = await loginFixtureUser(app);
      const tamperedCookies = {
        ...cookies,
        [AUTH_COOKIE_NAMES.access]: `${cookies[AUTH_COOKIE_NAMES.access]}tampered`,
      };
      const csrf = await fetchCsrf(app);

      const response = await withCsrf(
        api(app).post(API_PATHS.auth.logout),
        csrf,
        tamperedCookies,
      ).expect(204);

      expectAuthCookiesCleared(response.headers['set-cookie']);
    });

    it('still clears cookies when only refresh cookie is sent', async () => {
      const app = getApiTestApp();
      const { cookies } = await loginFixtureUser(app);
      const csrf = await fetchCsrf(app);

      const response = await withCsrf(
        api(app).post(API_PATHS.auth.logout),
        csrf,
        {
          [AUTH_COOKIE_NAMES.refresh]: cookies[AUTH_COOKIE_NAMES.refresh],
        },
      ).expect(204);

      expectAuthCookiesCleared(response.headers['set-cookie']);
    });

    it('issues a new session after logout and re-login', async () => {
      const app = getApiTestApp();
      const { cookies } = await loginFixtureUser(app);
      const logoutCsrf = await fetchCsrf(app);

      await withCsrf(
        api(app).post(API_PATHS.auth.logout),
        logoutCsrf,
        cookies,
      ).expect(204);

      const relogin = await loginFixtureUser(app);
      expect(relogin.cookies[AUTH_COOKIE_NAMES.access]).toBeTruthy();
      expect(relogin.cookies[AUTH_COOKIE_NAMES.refresh]).toBeTruthy();
    });
  });
});
