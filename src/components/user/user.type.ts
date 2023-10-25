import { JwtToken } from '../../utils/common.js';

interface IUser {
  telegram_id: number;
  first_name?: string;
  last_name?: string;
  telegram_username?: string;
  title?: string;
  age?: number;
  birthday?: Date;
  sex?: 'male' | 'female';
  gender?: 'heterosexual' | 'lesbi' | 'gay' | 'bisexial' /* ... */;
  language?: 'en' | 'ru';
  partner_id?: number;

  calculateAge(birthday: Date): number;
}

type PartnerDto = {
  partner_id: number;
  birthday: Date;
};

export { IUser, PartnerDto };
