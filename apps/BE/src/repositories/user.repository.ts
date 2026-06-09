import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@shared/dtos';
import type { IUserDocument } from '@quack/mongoose/models/user';
import { UserModel, UserPaths } from '@quack/mongoose/models/user';

export type CreateUserData = Pick<IUserDocument, 'email' | 'name' | 'password'>;
export type UserWithSecrets = AuthUser &
  Pick<IUserDocument, 'password' | 'refreshTokenHash'>;

@Injectable()
export class UserRepository {
  async create(data: CreateUserData): Promise<AuthUser> {
    const created = await UserModel.create({
      [UserPaths.email]: data.email,
      [UserPaths.name]: data.name,
      [UserPaths.password]: data.password,
    });

    return this.toAuthUser(created);
  }

  async findByEmailWithSecrets(email: string): Promise<UserWithSecrets | null> {
    const user = await UserModel.findOne({ [UserPaths.email]: email })
      .select(`+${UserPaths.password} +${UserPaths.refreshTokenHash}`)
      .exec();

    if (!user) {
      return null;
    }

    return {
      ...this.toAuthUser(user),
      password: user[UserPaths.password],
      refreshTokenHash: user[UserPaths.refreshTokenHash],
    };
  }

  async findById(id: string): Promise<AuthUser | null> {
    const user = await UserModel.findById(id).exec();
    if (!user) {
      return null;
    }

    return this.toAuthUser(user);
  }

  async findByIdWithRefreshToken(id: string): Promise<UserWithSecrets | null> {
    const user = await UserModel.findById(id)
      .select(`+${UserPaths.password} +${UserPaths.refreshTokenHash}`)
      .exec();

    if (!user) {
      return null;
    }

    return {
      ...this.toAuthUser(user),
      password: user[UserPaths.password],
      refreshTokenHash: user[UserPaths.refreshTokenHash],
    };
  }

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string,
  ): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          [UserPaths.refreshTokenHash]: refreshTokenHash,
          [UserPaths.refreshTokenRotatedAt]: new Date(),
        },
      },
    ).exec();
  }

  async clearRefreshTokenHash(userId: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $unset: {
          [UserPaths.refreshTokenHash]: 1,
        },
        $set: {
          [UserPaths.refreshTokenRotatedAt]: new Date(),
        },
      },
    ).exec();
  }

  private toAuthUser(user: IUserDocument): AuthUser {
    return {
      _id: user._id.toString(),
      email: user[UserPaths.email],
      name: user[UserPaths.name],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
