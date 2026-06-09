import { ENV_KEYS, NODE_ENV } from '@shared/constants';
import type { Params } from 'nestjs-pino';
import { getCorrelationId } from './correlation-id.context';

const nodeEnv = process.env[ENV_KEYS.NODE_ENV];
const isDevelopment = nodeEnv === NODE_ENV.DEVELOPMENT;
const isE2e = nodeEnv === NODE_ENV.E2E;

export const pinoLoggerConfig: Params = {
  pinoHttp: {
    level: isDevelopment ? 'debug' : 'info',
    enabled: !isE2e,
    transport: isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            translateTime: 'SYS:standard',
          },
        }
      : undefined,
    autoLogging: {
      ignore: (request) =>
        request.url === '/docs' || request.url === '/docs-json',
    },
    customProps: () => {
      const correlationId = getCorrelationId();
      return correlationId ? { correlationId } : {};
    },
    customSuccessMessage: (request, response) =>
      `${request.method} ${request.url} ${response.statusCode}`,
    customErrorMessage: (request, response) =>
      `${request.method} ${request.url} ${response.statusCode}`,
  },
};
