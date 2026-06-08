import { APP_NAME } from '@shared/constants';
import {
  getApiTestApp,
  registerApiTestLifecycle,
} from '../setup/api-spec-lifecycle';
import { api, API_PATHS, fullApiPath } from '../helpers/request';

describe(`GET ${fullApiPath()}`, () => {
  registerApiTestLifecycle();

  it('returns greeting with app name', async () => {
    const response = await api(getApiTestApp())
      .get(`${API_PATHS.root}?name=Quack`)
      .expect(200);

    expect(response.body).toEqual({
      name: 'Quack',
      appName: APP_NAME,
    });
  });
});
