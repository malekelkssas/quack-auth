import { model, Schema } from 'mongoose';
import type { IUserDocument } from './user.model';
import { UserPaths } from './user.paths';

export const USER_MODEL_NAME = 'User';

export const userSchema = new Schema<IUserDocument>(
  {
    [UserPaths.email]: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    [UserPaths.name]: {
      type: String,
      required: true,
      minlength: 3,
      trim: true,
    },
    [UserPaths.password]: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true },
);

export const UserModel = model<IUserDocument>(USER_MODEL_NAME, userSchema);
