import TelegrafI18n from 'telegraf-i18n';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

//logger.debug('Path '+path.resolve(__dirname, '../../src/locales'));
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const i18n = new TelegrafI18n({
  defaultLanguage: 'en',
  directory: path.resolve(__dirname, '../../src/locales'),
  useSession: true,
  allowMissing: false,
  sessionName: 'session',
});

export { i18n };
