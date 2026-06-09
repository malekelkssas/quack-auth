import { BE_ROUTES } from '@shared/constants';
import { Signup } from '@shared/dtos';
import api from '../axiosConfig';

export class AuthService {
  private static readonly AUTH_BASE = `/${BE_ROUTES.AUTH}`;

  static async signup(body: Signup): Promise<void> {
    await api.post(`${this.AUTH_BASE}/${BE_ROUTES.REGISTER}`, body);
  }
}
