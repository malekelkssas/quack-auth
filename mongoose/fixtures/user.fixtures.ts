import { UserPaths } from '../models/user/user.paths';

/** Plaintext password shared by default user fixtures (meets `Password` Zod schema). */
export const FIXTURE_USER_PASSWORD = 'Password1!' as const;

export interface UserFixture {
  [UserPaths.email]: string;
  [UserPaths.name]: string;
  [UserPaths.password]: string;
}

export const userFixtures: UserFixture[] = [
  {
    [UserPaths.email]: 'alice@example.com',
    [UserPaths.name]: 'Alice Quack',
    [UserPaths.password]: FIXTURE_USER_PASSWORD,
  },
  {
    [UserPaths.email]: 'bob@example.com',
    [UserPaths.name]: 'Bob Quacker',
    [UserPaths.password]: FIXTURE_USER_PASSWORD,
  },
  {
    [UserPaths.email]: 'admin@quack.dev',
    [UserPaths.name]: 'Admin Quack',
    [UserPaths.password]: 'AdminPass1!',
  },
];
