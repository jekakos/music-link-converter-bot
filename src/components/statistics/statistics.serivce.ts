import { injectable, inject } from 'inversify';
import { TYPES } from '../di/inversify.types.js';
import { ISessionService } from '../session/session.interface.js';
import { ICtxUpd } from '../bot/bot.context.js';
import { MiddlewareFn } from 'telegraf';
import axios from 'axios';
import { BotUserService } from '../bot/user/bot.user.service.js';
import { IConfigService } from '../config/config.service.interface.js';
import { ClickData, CommonForActions } from '../bot/actions/common.js';

@injectable()
export class StatisticsService {
  private sessionService: ISessionService;
  private configService: IConfigService;
  private GA4_API_SECRET: string;
  private GA4_MEASUREMENT_ID: string;
  private common: CommonForActions;

  constructor(
    @inject(TYPES.SessionService) sessionService: ISessionService,
    @inject(TYPES.ConfigService) configService: IConfigService,
    @inject(TYPES.CommonForActions) commonActions: CommonForActions,
  ) {
    this.sessionService = sessionService;
    this.configService = configService;
    this.common = commonActions;

    this.GA4_API_SECRET = this.configService.get('GA4_API_SECRET');
    this.GA4_MEASUREMENT_ID = this.configService.get('GA4_MEASUREMENT_ID');
  }

  async sendGAEvent(event: any): Promise<void> {
    const payload = {
      client_id: event.userId,
      events: [
        {
          name: event.name,
          params: event.params,
        },
      ],
    };

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${this.GA4_MEASUREMENT_ID}&api_secret=${this.GA4_API_SECRET}`;

    try {
      await axios.post(url, payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          'Error response from Google Analytics:',
          error.response.data,
        );
      } else {
        console.error('Error sending event to Google Analytics:', error);
      }
    }
    console.log('Event sent to Google Analytics: ', payload);
  }

  async sendReport(ctx: ICtxUpd, text: string) {
    const user = BotUserService.getUser(ctx);
    const userId = String(user.id);
    if (ctx.configService.isset('REPORTER_ID')) {
      const reporter_id = ctx.configService.get('REPORTER_ID');
      console.log('Trying to send message report');

      // without await to make it async
      ctx.telegram.sendMessage(
        reporter_id,
        'User: ' + userId + '(@' + user.username + '), message: ' + text,
      );

      this.sendGAEvent({
        userId: userId,
        name: 'message',
        params: {
          text: text,
        },
      });
    }
  }

  logAction(ctx: ICtxUpd, clickData: ClickData) {
    if (clickData) {
      const text = 'Button click = ' + clickData.to_platform;
      this.sendReport(ctx, text);
    }
  }

  createMiddleware(): MiddlewareFn<ICtxUpd> {
    return async (ctx: ICtxUpd, next) => {
      let text = '';
      if (ctx.message && 'text' in ctx.message) text = ctx.message?.text;
      if (text) {
        this.sendReport(ctx, text);
      }
      return await next();
    };
  }
}
