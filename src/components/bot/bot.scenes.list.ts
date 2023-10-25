import { Scenes } from 'telegraf';
import { ICtxUpd } from './bot.context.js';

import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../utils/logger.js';

let sceneList: Scenes.BaseScene<ICtxUpd>[] = [];

async function getSceneList(
  dir = './src/controllers/',
): Promise<Scenes.BaseScene<ICtxUpd>[]> {
  const sceneFiles = fs.readdirSync(dir);

  for (const sceneFile of sceneFiles) {
    const filePath = path.join(dir, sceneFile);

    if (fs.statSync(filePath).isDirectory()) {
      sceneList = sceneList.concat(await getSceneList(filePath));
    } else if (sceneFile.endsWith('.sc.ts')) {
      const moduleName = filePath
        .replace('src/', '../../')
        .replace('.ts', '.js');

      //logger.debug('Scene path: ' + moduleName);
      const sceneSet = await import(moduleName);

      if (sceneSet['default']) {
        logger.debug('Scene: ' + JSON.stringify(sceneSet['default']));
        sceneList.push(sceneSet['default']);
      }
    }
  }

  return sceneList;
}

export default getSceneList;
