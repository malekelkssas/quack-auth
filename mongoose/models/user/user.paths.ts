export const UserPaths = {
  email: 'email',
  name: 'name',
  password: 'password',
} as const;

export type UserPath = (typeof UserPaths)[keyof typeof UserPaths];
