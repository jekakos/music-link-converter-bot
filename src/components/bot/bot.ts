import { Markup, Scenes, Telegraf, session } from 'telegraf';
import { injectable, inject } from 'inversify';

import { IBot } from './bot.interface.js';
import { logger } from '../../utils/logger.js';
import { i18n } from '../../utils/i18n.js';
import { ICtxUpd } from './bot.context.js';
import { TYPES } from '../di/inversify.types.js';

import { handleUpdateCtx } from './bot.handle-update.js';
import getSceneList from './bot.scenes.list.js';

import { IConfigService } from '../config/config.service.interface.js';
import { ISessionService } from '../session/session.interface.js';
import { IUserService } from '../user/user.service.interface.js';
import { LinkService } from '../links/links.service.js';
import { IApiService } from '../api/api.service.interface.js';
import { StatisticsService } from '../statistics/statistics.serivce.js';

import { StartAction } from './actions/start.action.js';
import { MessageAction } from './actions/message.action.js';
import { GetLinkAction } from './actions/getlink.action.js';
import { GetTrackAction } from './actions/gettrack.action.js';

@injectable()
class Bot implements IBot {
  bot: Telegraf<ICtxUpd>;
  config: IConfigService;
  session: ISessionService;
  productionMode = false;
  userService: IUserService;
  qSession: any;
  statistics: StatisticsService;

  constructor(
    @inject(TYPES.ConfigService) config: IConfigService,
    @inject(TYPES.SessionService) sessionService: ISessionService,
    @inject(TYPES.UserService) userService: IUserService,
    @inject(TYPES.LinkService) linkService: LinkService,
    @inject(TYPES.ApiService) apiService: IApiService,
    @inject(TYPES.StatisticsService)
    statistics: StatisticsService,
  ) {
    this.config = config;
    this.session = sessionService;
    this.bot = new Telegraf<ICtxUpd>(config.get('TOKEN'));
    this.bot.context.sessionService = sessionService;
    this.bot.context.apiService = apiService;
    this.bot.context.linkService = linkService;
    this.userService = userService;
    this.qSession = {};
    this.statistics = statistics;
  }

  async init() {
    await this.session.connect(
      this.config.get('REDIS_HOST'),
      parseInt(this.config.get('REDIS_PORT')),
      this.config.get('REDIS_PASSWORD'),
    );
    this.bot.use(session());

    this.bot.use(i18n.middleware());

    this.bot.use(this.handleUpdate.bind(this));

    this.bot.use(this.statistics.createMiddleware());

    const sceneList = await getSceneList();
    //logger.debug('Scenes List: ' + JSON.stringify(sceneList));

    const stage = new Scenes.Stage<ICtxUpd>(sceneList);
    this.bot.use(stage.middleware());

    try {
      await this.bot.telegram.sendMessage(
        parseInt(this.config.get('OWNER_ID')),
        'Bot successfully restarted!',
      );
    } catch (error) {
      console.error('Failed to send startup message:', error);
    }

    // Actions
    new StartAction(this.bot).register();

    // bot.on('message')
    new MessageAction(this.bot, this.qSession).register();

    // action(/get_link\|(.+)/) - get link by link
    new GetLinkAction(this.bot, this.qSession).register();

    // action(/get_track\|(.+)/) - get linkk by artist + song title
    new GetTrackAction(this.bot, this.qSession).register();

    // Error handling
    this.bot.catch(async (error: any, ctx: ICtxUpd) => {
      console.log('Bot error', error);
      await ctx.replyWithHTML('Oops, error has happened. ' + error);
      logger.error('Global error has happened', error);
    });

    if (this.config.isProduction()) {
      this.startProdMode();
    } else {
      this.startDevMode();
    }

    this.bot.launch();
  }

  private startProdMode(): void {
    logger.debug('Launching a bot in Prod mode');
    //TODO: add webHook
    //this.bot.createWebhook(...)
  }

  private startDevMode(): void {
    logger.debug('Launching a bot in Dev mode');
  }

  private async handleUpdate(
    ctx: ICtxUpd,
    next: () => Promise<void>,
  ): Promise<void> {
    await handleUpdateCtx(this, ctx, next);
  }
}

export { Bot };
