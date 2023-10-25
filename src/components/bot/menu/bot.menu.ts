import { ICtxUpd } from '../bot.context.js';
import { MenuCommands } from '../commands/bot.commands.js';

// чтобы изменений вступили в силу, необходимо удалить чат с ботом (?)
function showMenu(ctx: ICtxUpd) {
  const commands = [];
  for (const key in MenuCommands) {
    commands.push({
      command: MenuCommands[key],
      description: ctx.i18n.t('menu.button.' + MenuCommands[key]),
    });
  }

  ctx.telegram.setMyCommands(commands);
}

export { showMenu };
