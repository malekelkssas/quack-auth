import { Injectable } from '@nestjs/common';
import type { IUser } from '@quack/mongoose/models/user';
import { UserModel, UserPaths } from '@quack/mongoose/models/user';

export type CreateUserData = Pick<IUser, 'email' | 'name' | 'password'>;

@Injectable()
export class UserRepository {
  async findByEmail(email: string): Promise<boolean> {
    const existing = await UserModel.exists({ [UserPaths.email]: email });
    return existing !== null;
  }

  async create(data: CreateUserData): Promise<void> {
    await UserModel.create({
      [UserPaths.email]: data.email,
      [UserPaths.name]: data.name,
      [UserPaths.password]: data.password,
    });
  }
}
