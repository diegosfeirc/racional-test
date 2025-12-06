import * as Joi from 'joi';
import { Environment } from './interfaces/config.interface';

const environmentValues: Environment[] = ['development', 'production', 'test'];

export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  NODE_ENV: Joi.string()
    .valid(...environmentValues)
    .default('development'),
  APP_NAME: Joi.string().default('Racional API'),
  APP_VERSION: Joi.string().default('1.0'),
});
