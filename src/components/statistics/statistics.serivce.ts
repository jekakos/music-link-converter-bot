import { injectable, inject } from 'inversify';
import { TYPES } from '../di/inversify.types.js';
import { ISessionService } from '../session/session.interface.js';
import { ICtxUpd } from '../bot/bot.context.js';
import { MiddlewareFn } from 'telegraf';
import axios from 'axios';
import { BotUserService } from '../bot/user/bot.user.service.js';
import { IConfigService } from '../config/config.service.interface.js';

@injectable()
export class StatisticsService {
  private sessionService: ISessionService;
  private configService: IConfigService;
  private GA4_API_SECRET: string;
  private GA4_MEASUREMENT_ID: string;

  constructor(
    @inject(TYPES.SessionService) sessionService: ISessionService,
    @inject(TYPES.ConfigService) configService: IConfigService,
  ) {
    this.sessionService = sessionService;
    this.configService = configService;

    this.GA4_API_SECRET = this.configService.get('GA4_API_SECRET');
    this.GA4_MEASUREMENT_ID = this.configService.get('GA4_MEASUREMENT_ID');
  }

  async sendEvent(event: any): Promise<void> {
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
      const response = await axios.post(url, payload);
      console.log('Event sent to Google Analytics:', response.data);
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
  }

  createMiddleware(): MiddlewareFn<ICtxUpd> {
    return (ctx, next) => {
      const user = BotUserService.getUser(ctx);
      const userId = String(user.id);

      let messageText = '';
      if (ctx.message && 'text' in ctx.message) messageText = ctx.message?.text;

      this.sendEvent({
        userId: userId,
        name: 'message',
        params: {
          text: messageText,
        },
      });

      return next();
    };
  }
}