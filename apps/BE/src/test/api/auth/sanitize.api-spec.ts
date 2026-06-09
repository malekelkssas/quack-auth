import { BE_ROUTES } from '@shared/constants';
import { FIXTURE_USER_PASSWORD } from '@quack/mongoose/fixtures';
import {
  getApiTestApp,
  registerApiTestLifecycle,
} from '../../setup/api-spec-lifecycle';
import { expectAuthUserShape } from '../../helpers/auth-user';
import { resetDb } from '../../helpers/db';
import { api, API_PATHS, fullApiPath } from '../../helpers/request';

describe(`POST ${fullApiPath(BE_ROUTES.AUTH, BE_ROUTES.REGISTER)} — XSS sanitize`, () => {
  registerApiTestLifecycle();

  beforeEach(async () => {
    await resetDb();
  });

  it('strips malicious HTML from name in 201 response', async () => {
    const app = getApiTestApp();
    const maliciousName = 'bad<script>alert(1)</script>guy';
    const payload = {
      email: 'xss-sanitize@example.com',
      name: maliciousName,
      password: FIXTURE_USER_PASSWORD,
    };

    const response = await api(app)
      .post(API_PATHS.auth.register)
      .send(payload)
      .expect(201);

    expectAuthUserShape(response.body.user, {
      email: payload.email,
      name: 'badguy',
    });
    expect(response.body.user.name).not.toContain('<');
    expect(response.body.user.name).not.toContain('script');
  });
});
