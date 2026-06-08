import type { IUser } from '../models/user/user.model';
import { UserPaths } from '../models/user/user.paths';

/** Plaintext password shared by default user fixtures (meets `Password` Zod schema). */
export const FIXTURE_USER_PASSWORD = 'Password1!' as const;

export const FIXTURE_ADMIN_PASSWORD = 'AdminPass1!' as const;

export type UserFixture = Pick<IUser, 'email' | 'name' | 'password'>;

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
    [UserPaths.password]: FIXTURE_ADMIN_PASSWORD,
  },
];
