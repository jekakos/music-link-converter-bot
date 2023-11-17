import { Telegraf } from 'telegraf';
import { ICtxUpd } from '../bot.context.js';
import { CommonForActions } from './common.js';
import { NotFoundError } from '../../api/api.service.errors.js';
import { StatisticsService } from '../../statistics/statistics.serivce.js';

export class GetTrackAction {
  constructor(
    private readonly bot: Telegraf<ICtxUpd>,
    private readonly qSession: any,
    private readonly common: CommonForActions,
    private readonly statistics: StatisticsService,
  ) {}

  register() {
    this.bot.action(/get_track\|(.+)/, async (ctx: ICtxUpd) => {
      const clickData = this.common.getClickButtonData(ctx, this.qSession);

      if (!clickData) throw Error('Wrong command');
      this.statistics.logAction(ctx, clickData);

      if (!clickData.track) throw Error('Wrong track info');

      let to_link;
      try {
        to_link = await ctx.apiService.getLinkByTrack(
          clickData.track,
          clickData.to_platform,
        );
      } catch (error) {
        if (error instanceof NotFoundError) {
          console.log('GET TRACK ERROR', error);
          await this.common.showNotFoundError(
            ctx,
            clickData.to_platform,
            error,
          );
        }
        return;
      }
      if (to_link) {
        await this.common.showLink(ctx, to_link);
      } else {
        console.log('Empty link!!!');
        ctx.reply(ctx.i18n.t('cannot_find_link'));
      }
    });
  }
}
