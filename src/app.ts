console.log('Starting app...');
import { IBot } from './components/bot/bot.interface.js';
import { TYPES } from './components/di/inversify.types.js';
import { container } from './components/di/inversify.js';

const bot = container.get<IBot>(TYPES.Bot);
bot.init();
