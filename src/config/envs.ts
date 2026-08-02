import * as joi from 'joi';
import * as dotenv from 'dotenv';
import { JwtSignOptions } from '@nestjs/jwt';

const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({
  path: [`.env.${nodeEnv}`, '.env'],
  override: true,
});

interface EnvVars {
  NODE_ENV: string;
  PORT: number;
  SWAGGER_ROUTE: string;
  SWAGGER_TITLE: string;
  SWAGGER_DESCRIPTION: string;
  SWAGGER_VERSION: string;
  SWAGGER_SERVERS: string;
  DATABASE_URL: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  REDIS_USER: string;
  REDIS_TTL: number;
  RENIEC_REDIS_DB: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: JwtSignOptions['expiresIn'];
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: JwtSignOptions['expiresIn'];
  AWS_S3_ENDPOINT: string;
  AWS_S3_REGION: string;
  AWS_S3_BUCKET: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  S3_FORCE_PATH_STYLE: boolean;
  URL_SCRAPPING_SUNAT: string;
  API_KEY_SCRAPPING_SUNAT: string;
  RENIEC_API_URL: string;
  RENIEC_USER: string;
  RENIEC_PASSWORD: string;
  RENIEC_DATABASE_URL: string;
  API_URL_UBIGEOS:string;
}

const envsSchema = joi
  .object({
    NODE_ENV: joi
      .string()
      .allow('development', 'production')
      .default('development'),
    PORT: joi.number().required(),
    SWAGGER_ROUTE: joi.string().required(),
    SWAGGER_TITLE: joi.string().required(),
    SWAGGER_DESCRIPTION: joi.string().required(),
    SWAGGER_VERSION: joi.string().required(),
    SWAGGER_SERVERS: joi.string().required(),
    DATABASE_URL: joi.string().required(),
    REDIS_HOST: joi.string().required(),
    REDIS_PORT: joi.number().required(),
    REDIS_PASSWORD: joi.string().optional().allow(''),
    REDIS_USER: joi.string().optional().allow(''),
    REDIS_TTL: joi.number().default(86400),
    RENIEC_REDIS_DB: joi.number().default(2),
    JWT_SECRET: joi.string().required(),
    JWT_EXPIRES_IN: joi.string().default('15min'),
    JWT_REFRESH_SECRET: joi.string().required(),
    JWT_REFRESH_EXPIRES_IN: joi.string().default('7d'),
    AWS_S3_ENDPOINT: joi.string().required(),
    AWS_S3_REGION: joi.string().default('us-east-1'),
    AWS_S3_BUCKET: joi.string().required(),
    AWS_ACCESS_KEY_ID: joi.string().required(),
    AWS_SECRET_ACCESS_KEY: joi.string().required(),
    S3_FORCE_PATH_STYLE: joi.boolean().default(true),
    URL_SCRAPPING_SUNAT: joi.string().required(),
    API_KEY_SCRAPPING_SUNAT: joi.string().required(),
    RENIEC_API_URL: joi.string().required(),
    RENIEC_USER: joi.string().required(),
    RENIEC_PASSWORD: joi.string().required(),
    RENIEC_DATABASE_URL: joi.string().required(),
    API_URL_UBIGEOS: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
}) as { error: joi.ValidationError | undefined; value: EnvVars };

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  swaggerRoute: envVars.SWAGGER_ROUTE,
  swaggerTitle: envVars.SWAGGER_TITLE,
  swaggerDescription: envVars.SWAGGER_DESCRIPTION,
  swaggerVersion: envVars.SWAGGER_VERSION,
  swaggerServers: envVars.SWAGGER_SERVERS,
  databaseUrl: envVars.DATABASE_URL,
  redisHost: envVars.REDIS_HOST,
  redisPort: envVars.REDIS_PORT,
  redisPassword: envVars.REDIS_PASSWORD,
  redisUser: envVars.REDIS_USER,
  redisTtl: envVars.REDIS_TTL,
  reniecRedisDb: envVars.RENIEC_REDIS_DB,
  jwtSecret: envVars.JWT_SECRET,
  jwtExpiresIn: envVars.JWT_EXPIRES_IN,
  jwtRefreshSecret: envVars.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  s3Endpoint: envVars.AWS_S3_ENDPOINT,
  s3Region: envVars.AWS_S3_REGION,
  s3Bucket: envVars.AWS_S3_BUCKET,
  s3AccessKey: envVars.AWS_ACCESS_KEY_ID,
  s3SecretKey: envVars.AWS_SECRET_ACCESS_KEY,
  s3ForcePathStyle: envVars.S3_FORCE_PATH_STYLE,
  sunatQueryApiUrl: envVars.URL_SCRAPPING_SUNAT,
  sunatApiKey: envVars.API_KEY_SCRAPPING_SUNAT,
  reniecApiUrl: envVars.RENIEC_API_URL,
  reniecUser: envVars.RENIEC_USER,
  reniecPassword: envVars.RENIEC_PASSWORD,
  reniecDatabaseUrl: envVars.RENIEC_DATABASE_URL,
  apiUrlUbigeos: envVars.API_URL_UBIGEOS,
};
