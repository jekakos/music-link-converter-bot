import { JwtToken } from '../../../src/utils/common.js';

export interface IHttpService {
  get<T>(route: string, token?: JwtToken): Promise<T>;
  post<T>(route: string, token: JwtToken, data: any): Promise<T>;
  patch<T>(route: string, token: JwtToken, data: any): Promise<T>;
  checkToken(telegram_id: number, token: string): boolean;
}
