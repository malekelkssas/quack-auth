import { BE_ROUTES } from '@shared/constants';
import { FIXTURE_USER_PASSWORD } from '@quack/mongoose/fixtures';
import { UserModel, UserPaths } from '@quack/mongoose/models/user';
import {
  getApiTestApp,
  registerApiTestLifecycle,
} from '../../setup/api-spec-lifecycle';
import { resetDb } from '../../helpers/db';
import { api, API_PATHS, fullApiPath } from '../../helpers/request';
import { UserRepository } from '../../../repositories/user.repository';

const validSignup = {
  email: 'txn-register@example.com',
  name: 'Txn User',
  password: FIXTURE_USER_PASSWORD,
};

describe(`MongoDB transactions (@MongoTransaction) ${fullApiPath(BE_ROUTES.AUTH, BE_ROUTES.REGISTER)}`, () => {
  registerApiTestLifecycle();

  let setRefreshTokenHashSpy: jest.SpyInstance;

  beforeEach(async () => {
    await resetDb();
    setRefreshTokenHashSpy = jest.spyOn(
      UserRepository.prototype,
      'setRefreshTokenHash',
    );
  });

  afterEach(() => {
    setRefreshTokenHashSpy.mockRestore();
  });

  it('register persists user document and refresh token hash together (201)', async () => {
    const app = getApiTestApp();
    const response = await api(app)
      .post(API_PATHS.auth.register)
      .send(validSignup)
      .expect(201);

    const stored = await UserModel.findOne({
      [UserPaths.email]: validSignup.email,
    })
      .select(`+${UserPaths.refreshTokenHash}`)
      .exec();

    expect(stored).not.toBeNull();
    expect(stored?.[UserPaths.refreshTokenHash]).toBeTruthy();
    expect(response.body.user._id).toBe(stored?._id.toString());
  });

  it('rolls back user create when refresh hash write fails inside the transaction', async () => {
    setRefreshTokenHashSpy.mockRejectedValueOnce(
      new Error('simulated refresh hash write failure'),
    );

    const app = getApiTestApp();
    await api(app).post(API_PATHS.auth.register).send(validSignup).expect(500);

    const count = await UserModel.countDocuments({
      [UserPaths.email]: validSignup.email,
    }).exec();

    expect(count).toBe(0);
    expect(setRefreshTokenHashSpy).toHaveBeenCalledTimes(1);
  });
});
