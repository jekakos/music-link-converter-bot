import { inject, injectable } from 'inversify';
import { TYPES } from '../di/inversify.types.js';
import { IConfigService } from '../config/config.service.interface.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { logger } from '../../utils/logger.js';
import { JwtToken } from '../../../src/utils/common.js';
import { BadRequestError, handleApiErrors } from './api.service.errors.js';
import { IHttpService } from './api.http.service.interface.js';

// Define the internal API service
@injectable()
export class HttpService implements IHttpService {
  private config: IConfigService;
  private apiURL: string;
  private isProduction: boolean;

  public constructor(@inject(TYPES.ConfigService) config: IConfigService) {
    this.config = config;
    this.apiURL = config.get('API_URL');
    this.isProduction = false;
  }

  private get protocol(): 'http' | 'https' {
    return this.isProduction ? 'https' : 'http';
  }

  async get<T>(route: string, token?: JwtToken): Promise<T> {
    const apiRoute = this.apiRoute(route);
    let response: any;

    logger.debug('Starting GET request to ' + apiRoute);

    try {
      if (token) {
        logger.debug('Request with token');
        response = await axios.get(apiRoute, {
          headers: { 'API-Token': token },
        });

        console.log('Response');
      } else {
        response = await axios.get(apiRoute);
      }
    } catch (error) {
      throw handleApiErrors(error);
    }

    logger.debug('Finished GET request to ' + apiRoute);

    if (response.status === 200) {
      return response.data as T;
    } else {
      throw new BadRequestError('API error ' + route);
    }
  }

  async post<T>(route: string, token: JwtToken, data: any): Promise<T> {
    const apiRoute = this.apiRoute(route);
    let response: any;

    try {
      response = await axios.post(apiRoute, data, {
        headers: { 'API-Token': token },
      });
    } catch (error) {
      throw handleApiErrors(error);
    }

    if (response.status === 200 || response.status === 201) {
      return response.data as T;
    } else {
      throw new BadRequestError('API error ' + route);
    }
  }

  async patch<T>(route: string, token: JwtToken, data: any): Promise<T> {
    const apiRoute = this.apiRoute(route);
    let response: any;

    logger.debug('PATCH route = ' + apiRoute);
    logger.debug('PATCH data = ' + JSON.stringify(data));

    try {
      response = await axios.patch(apiRoute, data, {
        headers: { 'API-Token': token },
      });
    } catch (error) {
      handleApiErrors(error);
    }

    if (response.status === 200 || response.status === 201) {
      return response.data as T;
    } else {
      throw new BadRequestError('API error ' + route);
    }
  }

  private apiRoute(apiPath: string): string {
    return this.protocol + '://' + this.apiURL + apiPath;
  }

  checkToken(telegram_id: number, token: string): boolean {
    const secret = this.config.get('API_SECRET');
    let decodedToken: any;
    if (this.isJwtToken(token)) {
      try {
        decodedToken = jwt.verify(token, secret);
      } catch (error) {
        logger.error('Cannot verify API token');
        return false;
      }
      if (decodedToken instanceof Object && 'sub' in decodedToken) {
        return parseInt(decodedToken.sub) == telegram_id;
      }
    }
    return false;
  }

  private isJwtToken(str: string): boolean {
    const regex = /^[^.]+\.[^.]+\.[^.]+$/;
    return regex.test(str);
  }
}
