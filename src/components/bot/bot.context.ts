import { Context, Scenes } from 'telegraf';
import { I18n } from 'telegraf-i18n';
import { ISessionService } from '../session/session.interface.js';
import { IBotUser } from './user/bot.user.type.js';
import { IConfigService } from '../config/config.service.interface.js';
import { IUser } from '../user/user.type.js';
import { LinkService } from '../links/links.service.js';
import { IApiService } from '../api/api.service.interface.js';

type SessionData = {
  data: any;
  user: IUser;
};

interface ICtxUpd extends Context {
  sessionData: SessionData;
  botUser: IBotUser;
  sessionService: ISessionService;
  configService: IConfigService;
  linkService: LinkService;
  apiService: IApiService;

  webhookReply: boolean;
  i18n: I18n;
  scene: Scenes.SceneContextScene<ICtxUpd, Scenes.SceneSessionData>;
}

export { ICtxUpd, SessionData };
