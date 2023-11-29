import { inject, injectable } from 'inversify';
import { NotFoundError } from '../../api/api.service.errors.js';
import { LinkService } from '../../links/links.service.js';
import { ICtxUpd } from '../bot.context.js';
import { TYPES } from '../../di/inversify.types.js';

export class ClickData {
  to_platform: string;
  link: string;
  track?: {
    artist: string;
    title: string;
  };
}

@injectable()
export class CommonForActions {
  private linkService: LinkService;
  constructor(@inject(TYPES.LinkService) linkService: LinkService) {
    this.linkService = linkService;
  }

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

    if (platform_info) {
      let message =
        ctx.i18n.t('cannot_find_track') +
        ' ' +
        ctx.i18n.t('in') +
        ' ' +
        platform_info.title;

      if (title && artist) {
        message += ', ' + ctx.i18n.t('search_on_streaming');
        const searchTerm = encodeURIComponent(`${title} - ${artist}`);
        const search_link = `&#128270 <a href="${
          platform_info.searchLink + searchTerm
        }">${title} - ${artist}</a>`;

        message += ' ' + search_link;
      }
      return message;
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

  getClickButtonData(ctx: ICtxUpd, session: any): ClickData | null {
    let key;
    if ('match' in ctx) {
      [, key] = ctx.match as RegExpExecArray;
      return session[ctx.botUser.id][key] ?? null;
    }
    return null;
  }
}
