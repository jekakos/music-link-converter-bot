import { Telegraf } from 'telegraf';
import { ICtxUpd } from './bot.context.js';
import { IConfigService } from '../config/config.service.interface.js';
import { ISessionService } from '../session/session.interface.js';
import { IUserService } from '../user/user.service.interface.js';

export interface IBot {
  bot: Telegraf<ICtxUpd>;
  config: IConfigService;
  session: ISessionService;
  userService: IUserService;

  init(): void;
}
