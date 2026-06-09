import { BE_ROUTES } from '@shared/constants';
import {
  getApiTestApp,
  registerApiTestLifecycle,
} from '../setup/api-spec-lifecycle';
import { api, API_PATHS, fullApiPath } from '../helpers/request';

describe(`Security headers on GET ${fullApiPath(BE_ROUTES.USERS, BE_ROUTES.ME)}`, () => {
  registerApiTestLifecycle();

  it('sets helmet X-Frame-Options and X-Content-Type-Options', async () => {
    const response = await api(getApiTestApp())
      .get(API_PATHS.users.me)
      .expect(401);

    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});
