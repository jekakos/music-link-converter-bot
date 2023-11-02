import { Telegraf } from 'telegraf';
import { ICtxUpd } from '../bot.context';

export class GetTrackAction {
  constructor(
    private readonly bot: Telegraf<ICtxUpd>,
    private readonly qSession: any,
  ) {}

  register() {
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
  }
}
