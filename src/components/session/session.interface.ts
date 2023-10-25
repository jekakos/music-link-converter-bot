export interface ISessionService {
  connect(
    host: string,
    port: number,
    password: string,
    db?: number,
  ): Promise<void>;
  getSession(key: string): Promise<any>;
  saveSession(key: string, newData: any, originalData?: any): Promise<void>;
  createSession(key: string): Promise<any>;
  deleteSession(key: string): Promise<void>;
}
