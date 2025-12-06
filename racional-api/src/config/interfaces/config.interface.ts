export type Environment = 'development' | 'production' | 'test';

export interface DatabaseConfig {
  url: string;
}

export interface AppMetadata {
  name: string;
  version: string;
  environment: Environment;
}

export interface AppConfig {
  port: number;
  database: DatabaseConfig;
  app: AppMetadata;
}
