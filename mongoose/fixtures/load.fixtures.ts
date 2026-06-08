import { UserModel } from '../models/user';
import type { IUserDocument } from '../models/user/user.model';
import { UserPaths } from '../models/user/user.paths';
import { userFixtures } from './user.fixtures';

export interface LoadFixturesOptions {
  /** Drop existing documents in seeded collections before insert. */
  reset?: boolean;
}

export async function loadUserFixtures(
  options: LoadFixturesOptions = {},
): Promise<IUserDocument[]> {
  if (options.reset) {
    await UserModel.deleteMany({});
  }

  const documents: IUserDocument[] = [];
  for (const fixture of userFixtures) {
    const existing = await UserModel.findOne({
      [UserPaths.email]: fixture[UserPaths.email],
    });
    if (existing) {
      documents.push(existing);
      continue;
    }
    documents.push(await UserModel.create(fixture));
  }
  return documents;
}

export async function loadFixtures(
  options: LoadFixturesOptions = {},
): Promise<{ users: IUserDocument[] }> {
  const users = await loadUserFixtures(options);
  return { users };
}
