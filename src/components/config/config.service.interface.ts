interface IConfigService {
  get(key: string): string;
  isProduction(): boolean;
}

export { IConfigService };
