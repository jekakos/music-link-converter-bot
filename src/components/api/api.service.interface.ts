export interface IApiService {
  getLink(link: string, to_platform: string): Promise<string>;
}
