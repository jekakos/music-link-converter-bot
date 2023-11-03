import { inject, injectable } from 'inversify';
import { IConfigService } from '../config/config.service.interface.js';
import { TYPES } from '../di/inversify.types.js';

export type PlatformListType = {
  [platformName: string]: {
    name: string;
    title: string;
    trackLink: string;
    searchLink?: string;
  };
};

export type MediaType = 'track' | 'album';

@injectable()
export class LinkService {
  private config: IConfigService;
  constructor(@inject(TYPES.ConfigService) config: IConfigService) {
    this.config = config;
  }

  private platformList: PlatformListType = {
    Spotify: {
      name: 'spotify',
      title: 'Spotify',
      trackLink: 'https://open.spotify.com/track/',
      searchLink: '',
    },
    YandexMusic: {
      name: 'yandex-music',
      title: 'Yandex Music',
      trackLink: 'https://music.yandex.ru/track/',
      searchLink: '',
    },
    YoutubeMusic: {
      name: 'youtube-music',
      title: 'YouTube Music',
      trackLink: 'https://music.youtube.com/watch?v=',
      searchLink: '',
    },
    AppleMusic: {
      name: 'apple-music',
      title: 'Apple Music',
      trackLink: 'https://music.apple.com/...',
      searchLink: '',
    },
  };

  detectPlatform(link: string): string | null {
    if (link.includes('spotify.com')) return this.platformList.Spotify.name;
    if (link.includes('music.yandex'))
      return this.platformList.YandexMusic.name;
    if (link.includes('music.youtube'))
      return this.platformList.YoutubeMusic.name;
    if (link.includes('music.apple.com'))
      return this.platformList.AppleMusic.name;

    return null;
  }

  detectMediaType(link: string, platform: string): MediaType | null {
    switch (platform) {
      case 'spotify':
        {
          if (link.includes('track')) return 'track';
        }
        break;

      case 'yandex-music':
        {
          if (link.includes('track')) return 'track';
        }
        break;

      case 'youtube-music':
        {
          if (link.includes('watch?v=')) return 'track';
        }
        break;
      case 'apple-music':
        {
          if (link.includes('?i=')) return 'track';
        }
        break;
    }

    return null;
  }

  extractTrackInfo(text: string): { artist: string; title: string } | null {
    // Основные разделители
    const delimiters = [' by ', ' - ', ' – ', '|', '•'];

    // Проверяем наличие ссылки на Shazam и добавляем специальный разделитель, если нужно
    if (text.includes('www.shazam.com')) {
      delimiters.push(' от ');
    }

    text = text.replace(/https?:\/\/[^\s]+/g, '');

    // Перебираем разделители и пытаемся найти соответствие
    for (const delimiter of delimiters) {
      const parts = text.split(delimiter);
      if (parts.length === 2) {
        const [artist, title] = parts.map((part) => part.trim());
        if (artist && title) {
          return { artist, title };
        }
      }
    }
    return null;
  }

  getPlatformListAll(): PlatformListType {
    return this.platformList;
  }

  getPlatformListByLink(link: string): PlatformListType {
    const from_platform = this.detectPlatform(link);
    if (!from_platform) throw Error('Wrong link');

    const toPlatformList: PlatformListType = {};

    for (const platform in this.platformList) {
      if (this.platformList[platform].name != from_platform) {
        toPlatformList[platform] = this.platformList[platform];
        //toPlatformList[platform].searchLink = this.createLink(platform, link);
      }
    }

    return toPlatformList;
  }

  /*
  createLink(to_platform: string, from_link: string): string {
    const encodedUrl = encodeURIComponent(from_link);
    return (
      this.config.get('API_URL') +
      this.config.get('API_REDIRECT_LINK') +
      'to_platform=' +
      to_platform +
      '&link=' +
      encodedUrl
    );
  }
  */
}
