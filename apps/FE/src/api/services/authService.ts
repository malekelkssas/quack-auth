import { BE_ROUTES } from '@shared/constants';
import { Signup } from '@shared/dtos';
import api from '../axiosConfig';

export class AuthService {
  private static readonly USERS_BASE = `/${BE_ROUTES.USERS}`;

  static async signup(body: Signup): Promise<void> {
    await api.post(`${this.USERS_BASE}/${BE_ROUTES.SIGNUP}`, body);
  }
}
