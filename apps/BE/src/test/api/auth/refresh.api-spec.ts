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
} from '../../helpers/cookies';
import { fetchCsrf, withCsrf } from '../../helpers/csrf';
import { expectApiError } from '../../helpers/expect-error';
import { resetDb } from '../../helpers/db';
import { api, API_PATHS, fullApiPath } from '../../helpers/request';

describe(`POST ${fullApiPath(BE_ROUTES.AUTH, BE_ROUTES.REFRESH)}`, () => {
  registerApiTestLifecycle();

  describe('with seeded database', () => {
    beforeEach(async () => {
      await resetDb();
    });

    it('rotates tokens and issues new auth cookies (200)', async () => {
      const app = getApiTestApp();
      const { cookies: loginCookies, user } = await loginFixtureUser(app);
      const csrf = await fetchCsrf(app);

      const response = await withCsrf(
        api(app).post(API_PATHS.auth.refresh),
        csrf,
        loginCookies,
      ).expect(200);

      expectAuthUserShape(response.body.user, {
        _id: user._id,
        email: user.email,
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
      const app = getApiTestApp();
      const csrf = await fetchCsrf(app);
      const response = await withCsrf(
        api(app).post(API_PATHS.auth.refresh),
        csrf,
      ).expect(401);

      expectApiError(response, 'Unauthorized');
      expectAuthCookiesCleared(response.headers['set-cookie']);
    });

    it('returns 401 and clears cookies for tampered refresh token', async () => {
      const app = getApiTestApp();
      const { cookies } = await loginFixtureUser(app);
      const tamperedRefresh = `${cookies[AUTH_COOKIE_NAMES.refresh]}tampered`;
      const csrf = await fetchCsrf(app);

      const response = await withCsrf(
        api(app).post(API_PATHS.auth.refresh),
        csrf,
        {
          ...cookies,
          [AUTH_COOKIE_NAMES.refresh]: tamperedRefresh,
        },
      ).expect(401);

      expectApiError(response, 'Unauthorized');
      expectAuthCookiesCleared(response.headers['set-cookie']);
    });

    it('returns 401 for one of two concurrent refresh requests with the same cookie', async () => {
      const app = getApiTestApp();
      const { cookies } = await loginFixtureUser(app);
      const csrf = await fetchCsrf(app);

      const [firstResponse, secondResponse] = await Promise.all([
        withCsrf(api(app).post(API_PATHS.auth.refresh), csrf, cookies),
        withCsrf(api(app).post(API_PATHS.auth.refresh), csrf, cookies),
      ]);

      const statuses = [firstResponse.status, secondResponse.status].sort(
        (left, right) => left - right,
      );
      expect(statuses).toEqual([200, 401]);

      const failedResponse =
        firstResponse.status === 401 ? firstResponse : secondResponse;
      expectApiError(failedResponse, 'Invalid refresh token');
      expectAuthCookiesCleared(failedResponse.headers['set-cookie']);
    });

    it('returns 401 when reusing a refresh token after rotation', async () => {
      const app = getApiTestApp();
      const { cookies: originalCookies } = await loginFixtureUser(app);
      const csrf = await fetchCsrf(app);

      await withCsrf(
        api(app).post(API_PATHS.auth.refresh),
        csrf,
        originalCookies,
      ).expect(200);

      const response = await withCsrf(
        api(app).post(API_PATHS.auth.refresh),
        csrf,
        originalCookies,
      ).expect(401);

      expectApiError(response, 'Invalid refresh token');
      expectAuthCookiesCleared(response.headers['set-cookie']);
    });
  });
});
