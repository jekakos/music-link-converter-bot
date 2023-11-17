import { Markup, Telegraf } from 'telegraf';
import { ICtxUpd } from '../bot.context.js';
import { ClickData } from './common.js';

export class MessageAction {
  constructor(
    private readonly bot: Telegraf<ICtxUpd>,
    private readonly qSession: any,
  ) {}

  private createKey(): string {
    return Math.random().toString(36).substring(5, 10) as string;
  }

  register() {
    // Send message with link or song name
    this.bot.on('message', async (ctx: ICtxUpd) => {
      if (!('text' in ctx.message!)) throw Error('Empty message');

      if (!this.qSession[ctx.botUser.id]) {
        const data: { [key: string]: ClickData } = {};
        this.qSession[ctx.botUser.id] = data;
      }
      const buttons = [];

      // --------------------------------------------------------
      // Converted platforms
      if (ctx.message.text.startsWith('https://')) {
        const messageLink = ctx.message.text;

        console.log('Message: ', messageLink);

        const from_platform = ctx.linkService.detectSourcePlatform(messageLink);
        if (!from_platform) {
          ctx.reply(ctx.i18n.t('platform_not_found'));
          return;
        }

        const mediaType = ctx.linkService.detectMediaType(
          messageLink,
          from_platform.name,
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

        for (const platform in platformList) {
          const key = this.createKey();

          this.qSession[ctx.botUser.id][key] = {
            to_platform: platformList[platform].name,
            link: messageLink,
          } as ClickData;

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

        for (const platform in platformList) {
          const key = this.createKey();

          this.qSession[ctx.botUser.id][key] = {
            to_platform: platformList[platform].name,
            link: '',
            track: {
              artist: trackInfo.artist,
              title: trackInfo.title,
            },
          } as ClickData;

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
  }
}
