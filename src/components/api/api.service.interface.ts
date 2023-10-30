export interface IApiService {
  getLink(link: string, to_platform: string): Promise<string>;
  getLinkByTrack(
    track: { artist: string; title: string },
    to_platform: string,
  ): Promise<string>;
}
