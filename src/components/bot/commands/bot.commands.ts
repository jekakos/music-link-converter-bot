import { SceneKeyType, SceneNames } from '../bot.scenes.js';

type BotCommandType = {
  command: string;
  scene: SceneKeyType;
  showInMenu: boolean;
};

type BotCommandsType = {
  [key: string]: BotCommandType;
};

const BotCommands: BotCommandsType = {
  AddPlatform: {
    command: 'my_platform',
    showInMenu: true,
    scene: SceneNames.MyPlatform,
  },
};

const MenuCommands: BotCommandType['command'][] = [];
for (const key in BotCommands) {
  if (BotCommands[key].showInMenu === true) {
    MenuCommands.push(BotCommands[key].command);
  }
}

export { MenuCommands, BotCommands, BotCommandsType };
