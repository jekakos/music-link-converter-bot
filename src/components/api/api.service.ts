import { inject, injectable } from 'inversify';
import { IApiService } from './api.service.interface.js';
import { TYPES } from '../di/inversify.types.js';
import { logger } from '../../utils/logger.js';
import { JwtToken } from '../../../src/utils/common.js';
import { IHttpService } from './api.http.service.interface.js';
import { handleApiErrors } from './api.service.errors.js';

// Define the internal API service
@injectable()
class ApiService implements IApiService {
  private http: IHttpService;

  //public setProductionMode(mode: boolean) {
  //  this.isProduction = mode;
  //}

  public constructor(@inject(TYPES.HttpService) http: IHttpService) {
    this.http = http;
  }

  async getLink(link: string, to_platform: string): Promise<string> {
    logger.error('Going to get link from API');
    const encodedUrl = encodeURIComponent(link);
    let response;

    try {
      response = await this.http.get<JwtToken>(
        '/get_link?link=' + encodedUrl + '&to_platform=' + to_platform,
      );
    } catch (error) {
      throw handleApiErrors(error);
    }

    if (!response) {
      throw new Error('Failed to get link from API');
    }
    return response;
  }
}

export { ApiService };
