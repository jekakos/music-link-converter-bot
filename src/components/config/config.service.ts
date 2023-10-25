import { config, DotenvParseOutput } from 'dotenv';
import { injectable } from 'inversify';
import { IConfigService } from './config.service.interface.js';

@injectable()
class EnvConfigService implements IConfigService {
  private config: DotenvParseOutput;

  constructor() {
    const { error, parsed } = config();
    if (error) {
      throw new Error('env config: File .env not found');
    }

    if (!parsed) {
      throw new Error('env config: Empty .env file');
    }

    this.config = parsed;
  }

  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production' ? true : false;
  }

  get(key: string): string {
    const res = this.config[key];
    if (!res) {
      throw new Error('env config: Key not found');
    }
    return res;
  }
}

export { EnvConfigService };
