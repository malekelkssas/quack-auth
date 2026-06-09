import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@shared/dtos';
import type { IUserDocument } from '@quack/mongoose/models/user';
import { UserModel, UserPaths } from '@quack/mongoose/models/user';

export type CreateUserData = Pick<IUserDocument, 'email' | 'name' | 'password'>;
export type UserWithPassword = AuthUser & Pick<IUserDocument, 'password'>;
export type UserWithRefreshHash = AuthUser &
  Pick<IUserDocument, 'refreshTokenHash'>;

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

  async findByEmailWithSecrets(
    email: string,
  ): Promise<UserWithPassword | null> {
    const user = await UserModel.findOne({ [UserPaths.email]: email })
      .select(`+${UserPaths.password}`)
      .exec();

    if (!user) {
      return null;
    }

    return {
      ...this.toAuthUser(user),
      password: user[UserPaths.password],
    };
  }

  async findById(id: string): Promise<AuthUser | null> {
    const user = await UserModel.findById(id).exec();
    if (!user) {
      return null;
    }

    return this.toAuthUser(user);
  }

  async findByIdWithRefreshToken(
    id: string,
  ): Promise<UserWithRefreshHash | null> {
    const user = await UserModel.findById(id)
      .select(`+${UserPaths.refreshTokenHash}`)
      .exec();

    if (!user) {
      return null;
    }

    return {
      ...this.toAuthUser(user),
      refreshTokenHash: user[UserPaths.refreshTokenHash],
    };
  }

  async setRefreshTokenHash(
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

  async rotateRefreshTokenHash(
    userId: string,
    expectedHash: string,
    newHash: string,
  ): Promise<boolean> {
    const result = await UserModel.updateOne(
      {
        _id: userId,
        [UserPaths.refreshTokenHash]: expectedHash,
      },
      {
        $set: {
          [UserPaths.refreshTokenHash]: newHash,
          [UserPaths.refreshTokenRotatedAt]: new Date(),
        },
      },
    ).exec();

    return result.modifiedCount === 1;
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

  withoutPassword(user: UserWithPassword): AuthUser {
    return this.pickPublicFields(user);
  }

  withoutRefreshHash(user: UserWithRefreshHash): AuthUser {
    return this.pickPublicFields(user);
  }

  private toAuthUser(user: IUserDocument): AuthUser {
    return this.pickPublicFields({
      _id: user._id.toString(),
      email: user[UserPaths.email],
      name: user[UserPaths.name],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  private pickPublicFields(user: AuthUser): AuthUser {
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
