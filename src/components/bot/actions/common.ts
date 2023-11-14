import { NotFoundError } from '../../api/api.service.errors.js';
import { LinkService } from '../../links/links.service.js';
import { ICtxUpd } from '../bot.context.js';

export class CommonForActions {
  constructor(private readonly linkService: LinkService) {}

  async showLink(ctx: ICtxUpd, to_link: string) {
    const handleBot = ctx.configService.get('BOT_HANDLE');
    const botName = ctx.configService.get('BOT_NAME');
    const messageText =
      to_link +
      ` - created with <a href="https://t.me/${handleBot}">${botName}</a>`;
    await ctx.replyWithHTML(messageText);
  }

  trackNotFound(
    ctx: ICtxUpd,
    to_platform: string,
    title?: string,
    artist?: string,
  ): string {
    const platform_info = this.linkService.getPlatformInfo(to_platform);
    console.log('Platform INFO: ', platform_info);

    if (platform_info && title && artist) {
      const message =
        ctx.i18n.t('cannot_find_track') +
        ' ' +
        ctx.i18n.t('on') +
        ' ' +
        platform_info.title +
        ', ' +
        ctx.i18n.t('search_on_streaming');
      const searchTerm = encodeURIComponent(`${title} - ${artist}`);
      const search_link = `&#128270 <a href="${
        platform_info.searchLink + searchTerm
      }">${title} - ${artist}</a>`;

      return message + ' ' + search_link;
    }
    return ctx.i18n.t('cannot_find_track');
  }

  async showNotFoundError(ctx: ICtxUpd, to_platform: string, error: any) {
    if (
      error instanceof NotFoundError &&
      error &&
      'artist' in error &&
      'title' in error &&
      error.artist &&
      error.title
    ) {
      await ctx.replyWithHTML(
        this.trackNotFound(
          ctx,
          to_platform,
          error.title as string,
          error.artist as string,
        ),
      );
    } else {
      ctx.replyWithHTML(this.trackNotFound(ctx, to_platform));
    }
  }
}
