import { API_ERROR_CODES, BE_ROUTES } from '@shared/constants';
import { userFixtures } from '@quack/mongoose/fixtures';
import {
  getApiTestApp,
  registerApiTestLifecycle,
} from '../../setup/api-spec-lifecycle';
import { loginFixtureUser } from '../../helpers/auth';
import { toCookieHeader } from '../../helpers/cookies';
import { fetchCsrf, withCsrf } from '../../helpers/csrf';
import { expectApiError } from '../../helpers/expect-error';
import { resetDb } from '../../helpers/db';
import { api, API_PATHS, fullApiPath } from '../../helpers/request';

const seededUser = userFixtures[0];

describe(`POST ${fullApiPath(BE_ROUTES.QUACK)}`, () => {
  registerApiTestLifecycle();

  describe('with seeded database', () => {
    beforeEach(async () => {
      await resetDb();
    });

    it('returns 401 without auth cookies', async () => {
      const app = getApiTestApp();
      const csrf = await fetchCsrf(app);

      const response = await withCsrf(api(app).post(API_PATHS.quack), csrf)
        .send({})
        .expect(401);

      expectApiError(response, 'Unauthorized');
    });

    it('returns 403 without CSRF header when logged in', async () => {
      const app = getApiTestApp();
      const { cookies } = await loginFixtureUser(app);

      const response = await api(app)
        .post(API_PATHS.quack)
        .set('Cookie', toCookieHeader(cookies))
        .send({})
        .expect(403);

      expectApiError(
        response,
        'invalid csrf token',
        API_ERROR_CODES.INVALID_CSRF_TOKEN,
      );
    });

    it('returns fixture user name quack for empty body (200)', async () => {
      const app = getApiTestApp();
      const { cookies } = await loginFixtureUser(app);
      const csrf = await fetchCsrf(app);

      const response = await withCsrf(
        api(app).post(API_PATHS.quack),
        csrf,
        cookies,
      )
        .send({})
        .expect(200);

      expect(response.body).toEqual({
        quack: `${seededUser.name} quack`,
      });
    });

    it('returns custom name quack when name is provided (200)', async () => {
      const app = getApiTestApp();
      const { cookies } = await loginFixtureUser(app);
      const csrf = await fetchCsrf(app);

      const response = await withCsrf(
        api(app).post(API_PATHS.quack),
        csrf,
        cookies,
      )
        .send({ name: 'Ducky' })
        .expect(200);

      expect(response.body).toEqual({ quack: 'Ducky quack' });
    });

    it('strips malicious HTML from optional name (200)', async () => {
      const app = getApiTestApp();
      const { cookies } = await loginFixtureUser(app);
      const csrf = await fetchCsrf(app);

      const response = await withCsrf(
        api(app).post(API_PATHS.quack),
        csrf,
        cookies,
      )
        .send({ name: 'xy<script>a</script>b' })
        .expect(200);

      expect(response.body).toEqual({ quack: 'xyb quack' });
    });
  });
});
