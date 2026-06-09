import type { INestApplication } from '@nestjs/common';
import { FIXTURE_USER_PASSWORD, userFixtures } from '@quack/mongoose/fixtures';
import { api, API_PATHS } from './request';
import { parseCookiesFromResponse } from './cookies';

type LoginOptions = {
  email?: string;
  password?: string;
};

export async function loginFixtureUser(
  app: INestApplication,
  options: LoginOptions = {},
) {
  const email = options.email ?? userFixtures[0].email;
  const password = options.password ?? FIXTURE_USER_PASSWORD;

  const response = await api(app)
    .post(API_PATHS.auth.login)
    .send({ email, password })
    .expect(200);

  return {
    response,
    cookies: parseCookiesFromResponse(response),
    user: response.body.user as Record<string, unknown>,
  };
}

export async function registerUser(
  app: INestApplication,
  body: Record<string, unknown>,
) {
  const response = await api(app)
    .post(API_PATHS.auth.register)
    .send(body)
    .expect(201);

  return {
    response,
    cookies: parseCookiesFromResponse(response),
    user: response.body.user as Record<string, unknown>,
  };
}
