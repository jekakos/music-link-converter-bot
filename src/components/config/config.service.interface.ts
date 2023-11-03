interface IConfigService {
  isset(key: string): boolean;
  get(key: string): string;
  isProduction(): boolean;
}

export { IConfigService };
