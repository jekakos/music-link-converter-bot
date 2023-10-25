import { JwtToken } from '../../utils/common.js';
import { IBotUser } from '../bot/user/bot.user.type.js';
import { IUser } from './user.type.js';

export interface IUserService {
  //getData(token: JwtToken): Promise<UserDataDTO | null>;
  restoreUserFromSession(
    botUser: IBotUser,
    session: any /* TODO */,
  ): Promise<IUser>;
  registerUserToken(
    telegram_id: number,
    password: string,
  ): Promise<JwtToken> | null;
}
