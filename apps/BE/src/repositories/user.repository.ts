import { Injectable } from '@nestjs/common';
import {
  IUserDocument,
  UserModel,
  UserPaths,
} from '@quack/mongoose/models/user';

export type CreateUserData = {
  email: string;
  name: string;
  password: string;
};

@Injectable()
export class UserRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ [UserPaths.email]: email });
  }

  async create(data: CreateUserData): Promise<void> {
    await UserModel.create({
      [UserPaths.email]: data.email,
      [UserPaths.name]: data.name,
      [UserPaths.password]: data.password,
    });
  }
}
