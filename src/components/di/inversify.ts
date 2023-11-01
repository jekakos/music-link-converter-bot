import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './inversify.types.js';
import { IBot } from '../bot/bot.interface.js';
import { IConfigService } from '../config/config.service.interface.js';
import { EnvConfigService } from '../config/config.service.js';
import { Bot } from '../bot/bot.js';

import { ISessionService } from '../session/session.interface.js';
import { RedisSessionService } from '../session/session.service.js';
import { IUserService } from '../user/user.service.interface.js';
import { UserService } from '../user/user.service.js';
import { LinkService } from '../links/links.service.js';

import { IHttpService } from '../api/api.http.service.interface.js';
import { HttpService } from '../api/api.http.service.js';

import { IApiService } from '../api/api.service.interface.js';
import { ApiService } from '../api/api.service.js';
import { StatisticsService } from '../statistics/statistics.serivce.js';

const container = new Container();

// Resolving dependencies
container.bind<IConfigService>(TYPES.ConfigService).to(EnvConfigService);
container.bind<IBot>(TYPES.Bot).to(Bot);
container.bind<ISessionService>(TYPES.SessionService).to(RedisSessionService);
container.bind<IUserService>(TYPES.UserService).to(UserService);
container.bind<LinkService>(TYPES.LinkService).to(LinkService);

container.bind<IApiService>(TYPES.ApiService).to(ApiService);
container.bind<IHttpService>(TYPES.HttpService).to(HttpService);

container
  .bind<StatisticsService>(TYPES.StatisticsService)
  .to(StatisticsService);

export { container };
