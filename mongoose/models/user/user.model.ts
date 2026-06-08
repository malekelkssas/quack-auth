import type { Document, Types } from 'mongoose';

export interface IUser {
  email: string;
  name: string;
  password: string;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
