import { UserModel } from '../models/user';
import type { IUserDocument } from '../models/user/user.model';
import { UserPaths } from '../models/user/user.paths';
import { userFixtures } from './user.fixtures';

export interface LoadFixturesOptions {
  reset?: boolean;
}

export async function loadFixtures(
  options: LoadFixturesOptions = {},
): Promise<IUserDocument[]> {
  if (options.reset) {
    await UserModel.deleteMany({});
    const documents: IUserDocument[] = [];
    for (const fixture of userFixtures) {
      documents.push(await UserModel.create(fixture));
    }
    return documents;
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
