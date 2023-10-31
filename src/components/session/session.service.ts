import { injectable } from 'inversify';
import { RedisOptions, Redis } from 'ioredis';
import { ISessionService } from './session.interface.js';
import { logger } from '../../utils/logger.js';

@injectable()
export class RedisSessionService implements ISessionService {
  private redisClient!: Redis;

  async connect(
    host: string,
    port: number,
    password: string,
    db = 0,
  ): Promise<void> {
    const redisOptions: RedisOptions = {
      host: host,
      port: port,
      password: password,
      db: db,
    };

    console.log('Connect to Rdis: ', redisOptions);
    this.redisClient = new Redis(redisOptions);

    return new Promise((resolve, reject) => {
      this.redisClient.on('ready', () => {
        logger.debug('Redis was connected');
        resolve();
      });

      this.redisClient.on('error', (error) => {
        logger.error('Error connecting to Redis:', error);
        reject(error);
      });
    });
  }

  async getSession(key: string): Promise<any | undefined> {
    const sessionData = await this.redisClient.get(key);
    if (sessionData) {
      logger.debug('Get session = ' + sessionData);
      return JSON.parse(sessionData);
    }
    return undefined;
  }

  async saveSession(
    key: string,
    newData: any,
    originalData?: any,
  ): Promise<void> {
    const sessionData = JSON.stringify(newData);
    //console.log('New session data:', sessionData);
    //console.log('Old session data:', JSON.stringify(originalData));
    if (originalData && JSON.stringify(originalData) == sessionData) {
      logger.debug('Dont need to save session for ' + key);
    } else {
      logger.debug('Save session for ' + key + ': ' + sessionData);
      await this.redisClient.set(key, sessionData);
    }
  }

  async createSession(key: string): Promise<any> {
    console.log('Create session');
    const emptySession = {
      user: {
        telegram_id: key,
      },
      data: {},
    };
    await this.saveSession(key, emptySession);
    return emptySession;
  }

  async deleteSession(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
