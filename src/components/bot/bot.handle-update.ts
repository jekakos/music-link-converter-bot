import { IBot } from './bot.interface.js';
import { ICtxUpd } from './bot.context.js';
import { BotUserService } from './user/bot.user.service.js';
import { logger } from '../../utils/logger.js';
import _ from 'lodash';

export async function handleUpdateCtx(
  bot: IBot,
  ctx: ICtxUpd,
  next: () => Promise<void>,
) {
  //before action
  logger.debug('------------ Start new action');

  //get infor about Bot user
  ctx.botUser = BotUserService.getUser(ctx); //TODO injection

  //load session from Redis
  const telegram_id = ctx.botUser.id.toString();
  let session = await bot.session.getSession(telegram_id);
  if (!session) {
    session = await bot.session.createSession(ctx.botUser.id.toString());
  }

  const user = await bot.userService.restoreUserFromSession(
    ctx.botUser,
    session,
  );

  console.log('Session from Redis:', session);

  const locale = session.language ?? 'en';
  ctx.i18n.locale(locale);

  ctx.sessionData = _.cloneDeep({
    user: user,
    data: session.data,
  });

  //action
  logger.debug('------------ Action');

  try {
    await next();
  } catch (error) {
    if (error instanceof Error) {
      console.error('next() error:', error.stack);
    } else {
      console.error('next() error:', error);
    }
    throw error;
  }

  //ctx.sessionData.state.tests.isIntoShown = false;

  //after session
  logger.debug('------------ After action');
  if (ctx.sessionData) {
    logger.debug('Going to save');
    console.log('Session NEW:', ctx.sessionData);
    console.log('Session OLD:', session);
    await bot.session.saveSession(telegram_id, ctx.sessionData, session);
  }
  console.log('End');
}
