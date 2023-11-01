import { Markup, Scenes, Telegraf, session } from 'telegraf';
import { IBot } from './bot.interface.js';
import { IConfigService } from '../config/config.service.interface.js';
import { injectable, inject } from 'inversify';
import { logger } from '../../utils/logger.js';
import { i18n } from '../../utils/i18n.js';
import { ICtxUpd } from './bot.context.js';
import { TYPES } from '../di/inversify.types.js';
import { ISessionService } from '../session/session.interface.js';
import { handleUpdateCtx } from './bot.handle-update.js';
import getSceneList from './bot.scenes.list.js';
import { IUserService } from '../user/user.service.interface.js';
import { LinkService } from '../links/links.service.js';
import { IApiService } from '../api/api.service.interface.js';
import { StatisticsService } from '../statistics/statistics.serivce.js';

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

    this.bot.start(async (ctx: ICtxUpd) => {
      ctx.replyWithHTML(
        ctx.sessionData.user.title +
          ', ' +
          ctx.i18n.t('scenes.start.welcome_message'),
      );
    });

    // Send message with link or song name
    this.bot.on('message', async (ctx: ICtxUpd) => {
      if (!('text' in ctx.message!)) throw Error('Empty message');

      // --------------------------------------------------------
      // Converted platforms
      if (ctx.message.text.startsWith('https://')) {
        const messageLink = ctx.message.text;

        console.log('Message: ', messageLink);

        const from_platform = ctx.linkService.detectPlatform(messageLink);
        if (!from_platform) {
          ctx.reply(ctx.i18n.t('platform_not_found'));
          return;
        }

        const mediaType = ctx.linkService.detectMediaType(
          messageLink,
          from_platform,
        );

        if (!mediaType || mediaType != 'track') {
          ctx.reply(ctx.i18n.t('wrong_madia_type'));
          return;
        }

        // Create keyboard
        let platformList;
        try {
          platformList = ctx.linkService.getPlatformListByLink(messageLink);
        } catch (error) {
          throw error;
        }

        console.log('Platforms: ', platformList);

        const buttons = [];
        if (!this.qSession[ctx.botUser.id]) {
          this.qSession[ctx.botUser.id] = {};
        }

        for (const platform in platformList) {
          const key = Math.random().toString(36).substring(6, 10);

          this.qSession[ctx.botUser.id][key] = {
            to_platform: platformList[platform].name,
            link: messageLink,
          };

          buttons.push([
            Markup.button.callback(
              `${platformList[platform].title}`,
              'get_link|' + key,
            ),
          ]);
        }

        const keyboard = Markup.inlineKeyboard(buttons);
        ctx.replyWithHTML(ctx.i18n.t('choose_platform'), keyboard);
        return;
      }

      // --------------------------------------------------------
      // Search by track info
      const trackInfo = ctx.linkService.extractTrackInfo(ctx.message.text);

      if (trackInfo) {
        const platformList = ctx.linkService.getPlatformListAll();
        const buttons = [];
        if (!this.qSession[ctx.botUser.id]) {
          this.qSession[ctx.botUser.id] = {};
        }

        for (const platform in platformList) {
          const key = Math.random().toString(36).substring(6, 10);

          this.qSession[ctx.botUser.id][key] = {
            to_platform: platformList[platform].name,
            track: {
              artist: trackInfo.artist,
              title: trackInfo.title,
            },
          };

          buttons.push([
            Markup.button.callback(
              `${platformList[platform].title}`,
              'get_track|' + key,
            ),
          ]);
        }

        const keyboard = Markup.inlineKeyboard(buttons);
        ctx.replyWithHTML(ctx.i18n.t('choose_platform'), keyboard);

        return;
      }

      ctx.reply(ctx.i18n.t('platform_not_found'));
    });

    // --------------------------------------------------------
    // Action get_link
    this.bot.action(/get_link\|(.+)/, async (ctx: ICtxUpd) => {
      let key;
      let keyData;

      if ('match' in ctx) {
        [, key] = ctx.match as RegExpExecArray;
        keyData = this.qSession[ctx.botUser.id][key] ?? null;
      } else {
        throw Error('Wrong command 1');
      }

      if (!keyData) throw Error('Wrong command 2');

      console.log('Link from platform = ', keyData.link);

      let to_link;
      try {
        to_link = await ctx.apiService.getLink(
          keyData.link,
          keyData.to_platform,
        );
      } catch (error) {
        ctx.reply(ctx.i18n.t('cannot_find_link'));
        return;
      }
      await ctx.reply(to_link as string);
    });

    // --------------------------------------------------------
    // Action get_track
    this.bot.action(/get_track\|(.+)/, async (ctx: ICtxUpd) => {
      let key;
      let keyData;

      if ('match' in ctx) {
        [, key] = ctx.match as RegExpExecArray;
        keyData = this.qSession[ctx.botUser.id][key] ?? null;
      } else {
        throw Error('Wrong command 1');
      }

      if (!keyData) throw Error('Wrong command 2');

      console.log('Track = ', keyData.track);

      let to_link;
      try {
        to_link = await ctx.apiService.getLinkByTrack(
          keyData.track,
          keyData.to_platform,
        );
      } catch (error) {
        ctx.reply(ctx.i18n.t('cannot_find_link'));
        return;
      }
      await ctx.reply(to_link as string);
    });

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
