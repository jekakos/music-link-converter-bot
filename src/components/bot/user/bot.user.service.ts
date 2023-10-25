import { injectable } from 'inversify';
import { ICtxUpd } from '../bot.context.js';
import { IBotUser } from './bot.user.type.js';

@injectable()
export class BotUserService {
  static getUser(ctx: ICtxUpd): IBotUser {
    if (ctx.from && ctx.from.id) {
      return ctx.from;
    } else if (
      ctx.callbackQuery &&
      ctx.callbackQuery.from &&
      ctx.callbackQuery.from.id
    ) {
      return ctx.callbackQuery.from;
    } else if (
      ctx.inlineQuery &&
      ctx.inlineQuery.from &&
      ctx.inlineQuery.from.id
    ) {
      return ctx.inlineQuery.from;
    } else if (
      ctx.chosenInlineResult &&
      ctx.chosenInlineResult.from &&
      ctx.chosenInlineResult.from.id
    ) {
      return ctx.chosenInlineResult.from;
    } else if (ctx.message && ctx.message.from && ctx.message.from.id) {
      return ctx.message.from;
    } else if (
      ctx.pollAnswer &&
      ctx.pollAnswer.user &&
      ctx.pollAnswer.user.id
    ) {
      return ctx.pollAnswer.user;
    } else {
      throw Error('Cannot get Telegram User');
    }
  }
}
