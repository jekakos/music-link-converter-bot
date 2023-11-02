import { Telegraf } from 'telegraf';
import { ICtxUpd } from '../bot.context';

export class StartAction {
  constructor(private readonly bot: Telegraf<ICtxUpd>) {}

  register() {
    this.bot.start(async (ctx: ICtxUpd) => {
      ctx.replyWithHTML(
        ctx.sessionData.user.title +
          ', ' +
          ctx.i18n.t('scenes.start.welcome_message'),
      );
    });
  }
}
