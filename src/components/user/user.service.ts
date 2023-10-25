import { injectable } from 'inversify';
import { JwtToken } from '../../../src/utils/common.js';
import { IBotUser } from '../bot/user/bot.user.type.js';
import { User } from './user.model.js';
import { IUserService } from './user.service.interface.js';
import { IUser } from './user.type.js';

@injectable()
export class UserService implements IUserService {
  registerUserToken(
    telegram_id: number,
    password: string,
  ): Promise<JwtToken> | null {
    return null;
  }

  restoreUserFromSession(
    botUser: IBotUser,
    session: any /* TODO */,
  ): Promise<IUser> {
    const user = new User(botUser);
    if (!session.hasOwnProperty('user')) session.user = {};

    user.first_name = session.user.first_name ?? botUser.first_name ?? '';
    user.last_name = session.user.last_name ?? botUser.last_name ?? '';
    user.title =
      user.first_name ??
      user.last_name ??
      '@' + user.telegram_username ??
      'User';

    user.age = 'age' in session.user ? session.user.age : undefined;
    user.birthday =
      'birthday' in session.user ? session.user.birthday : undefined;
    user.sex = 'age' in session.user ? session.user.sex : undefined;
    user.gender = 'sex' in session.user ? session.user.gender : undefined;
    user.language =
      'language' in session.user ? session.user.language : undefined;
    user.partner_id =
      'partner_id' in session.user ? session.user.partner_id : undefined;

    return Promise.resolve(user);
  }
}
