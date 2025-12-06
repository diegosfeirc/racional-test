import { AppConfig, Environment } from './interfaces/config.interface';

const getEnvironment = (): Environment => {
  const env = process.env.NODE_ENV;
  if (env === 'production' || env === 'test' || env === 'development') {
    return env;
  }
  return 'development';
};

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  app: {
    name: process.env.APP_NAME ?? 'Racional API',
    version: process.env.APP_VERSION ?? '1.0',
    environment: getEnvironment(),
  },
});
