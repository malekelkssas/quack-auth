import { BE_ROUTES } from '@shared/constants';
import { FIXTURE_USER_PASSWORD, userFixtures } from '@quack/mongoose/fixtures';
import { UserModel, UserPaths } from '@quack/mongoose/models/user';
import {
  getApiTestApp,
  registerApiTestLifecycle,
} from '../../setup/api-spec-lifecycle';
import { loginFixtureUser, registerUser } from '../../helpers/auth';
import { expectAuthUserShape } from '../../helpers/auth-user';
import { toCookieHeader } from '../../helpers/cookies';
import { resetDb } from '../../helpers/db';
import { api, API_PATHS, fullApiPath } from '../../helpers/request';

const SECRET_KEYS = [
  'password',
  'refreshTokenHash',
  'refreshTokenRotatedAt',
] as const;

function expectNoSecretsInJson(value: unknown, path = 'body'): void {
  if (value === null || typeof value !== 'object') {
    return;
  }

  for (const key of Object.keys(value as Record<string, unknown>)) {
    const fullPath = `${path}.${key}`;
    expect(SECRET_KEYS).not.toContain(key);
    expectNoSecretsInJson((value as Record<string, unknown>)[key], fullPath);
  }
}

describe(`Auth response secrets ${fullApiPath(BE_ROUTES.AUTH, '*')}`, () => {
  registerApiTestLifecycle();

  beforeEach(async () => {
    await resetDb();
  });

  it('register response exposes AuthUser only — hash stored server-side', async () => {
    const app = getApiTestApp();
    const payload = {
      email: 'secrets-register@example.com',
      name: 'Secrets Register',
      password: FIXTURE_USER_PASSWORD,
    };
    const { response, user } = await registerUser(app, payload);

    expectAuthUserShape(response.body.user, {
      email: payload.email,
      name: payload.name,
    });
    expectNoSecretsInJson(response.body);

    const stored = await UserModel.findOne({
      [UserPaths.email]: payload.email,
    })
      .select(`+${UserPaths.password} +${UserPaths.refreshTokenHash}`)
      .exec();

    if (!stored) {
      throw new Error('Expected user document after register');
    }
    expect(stored[UserPaths.password]).toBeTruthy();
    expect(stored[UserPaths.password]).not.toBe(payload.password);
    expect(user._id).toBe(stored._id.toString());
  });

  it('login response exposes AuthUser only — refresh hash stored server-side', async () => {
    const app = getApiTestApp();
    const { response, user } = await loginFixtureUser(app);

    expectAuthUserShape(response.body.user, {
      email: userFixtures[0].email,
      name: userFixtures[0].name,
    });
    expectNoSecretsInJson(response.body);

    const stored = await UserModel.findById(user._id)
      .select(`+${UserPaths.refreshTokenHash}`)
      .exec();

    if (!stored) {
      throw new Error('Expected user document after login');
    }
    expect(stored[UserPaths.refreshTokenHash]).toBeTruthy();
  });

  it('refresh response exposes AuthUser only', async () => {
    const app = getApiTestApp();
    const { cookies, user } = await loginFixtureUser(app);

    const response = await api(app)
      .post(API_PATHS.auth.refresh)
      .set('Cookie', toCookieHeader(cookies))
      .expect(200);

    expectAuthUserShape(response.body.user, {
      _id: user._id,
      email: user.email,
    });
    expectNoSecretsInJson(response.body);
  });

  it('GET /users/me response exposes AuthUser only', async () => {
    const app = getApiTestApp();
    const { cookies, user } = await loginFixtureUser(app);

    const response = await api(app)
      .get(API_PATHS.users.me)
      .set('Cookie', toCookieHeader(cookies))
      .expect(200);

    expectAuthUserShape(response.body.user, {
      _id: user._id,
      email: user.email,
      name: user.name,
    });
    expectNoSecretsInJson(response.body);
    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('refreshTokenHash');
  });
});
