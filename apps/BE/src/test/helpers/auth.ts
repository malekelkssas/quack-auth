import type { INestApplication } from '@nestjs/common';
import type { AuthUser, Signup } from '@shared/dtos';
import { FIXTURE_USER_PASSWORD, userFixtures } from '@quack/mongoose/fixtures';
import { api, API_PATHS } from './request';
import { parseCookiesFromResponse } from './cookies';

type AuthSession = {
  response: { body: { user: AuthUser }; headers: Record<string, unknown> };
  cookies: Record<string, string>;
  user: AuthUser;
};

async function createAuthSession(
  app: INestApplication,
  path: string,
  body: Record<string, unknown>,
  expectedStatus: number,
): Promise<AuthSession> {
  const response = await api(app).post(path).send(body).expect(expectedStatus);

  return {
    response,
    cookies: parseCookiesFromResponse(response),
    user: response.body.user as AuthUser,
  };
}

type LoginOptions = {
  email?: string;
  password?: string;
};

export async function loginFixtureUser(
  app: INestApplication,
  options: LoginOptions = {},
): Promise<AuthSession> {
  return createAuthSession(
    app,
    API_PATHS.auth.login,
    {
      email: options.email ?? userFixtures[0].email,
      password: options.password ?? FIXTURE_USER_PASSWORD,
    },
    200,
  );
}

export async function registerUser(
  app: INestApplication,
  body: Signup,
): Promise<AuthSession> {
  return createAuthSession(app, API_PATHS.auth.register, body, 201);
}
