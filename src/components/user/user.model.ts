import { injectable } from 'inversify';
import { IUser } from './user.type.js';
import { ICtxUpd } from '../bot/bot.context.js';
import { TYPES } from '../di/inversify.types.js';
import { IUserService } from './user.service.interface.js';
import { JwtToken } from '../../../src/utils/common.js';
import { IBotUser } from '../bot/user/bot.user.type.js';

@injectable()
export class User implements IUser {
  telegram_id: number;
  first_name?: string;
  last_name?: string;
  telegram_username?: string;

  title?: string;
  age?: number;
  birthday?: Date;
  sex?: 'male' | 'female';
  gender?: 'heterosexual' | 'lesbi' | 'gay' | 'bisexial';
  language?: 'en' | 'ru';
  partner_id?: number;

  private token?: JwtToken;

  public constructor(botUser: IBotUser) {
    if (botUser == null) throw Error("Can't find Telegram User");
    this.telegram_id = botUser.id;
    this.telegram_username = botUser.username ?? '';
  }

  public calculateAge(birthday: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthday.getDate())
    ) {
      age--;
    }
    return age;
  }
}
