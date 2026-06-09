import { ENV_KEYS, NODE_ENV } from '@shared/constants';
import {
  assertProductionSecret,
  resolveAuthSecret,
  resolvePositiveIntEnv,
} from '../../utils/auth-config.util';

describe('auth-config.util', () => {
  describe('resolvePositiveIntEnv', () => {
    it('returns fallback when env is missing, empty, invalid, or non-positive', () => {
      const key = ENV_KEYS.AUTH_THROTTLE_LIMIT;
      const previous = process.env[key];

      try {
        delete process.env[key];
        expect(resolvePositiveIntEnv(key, 10)).toBe(10);

        process.env[key] = '   ';
        expect(resolvePositiveIntEnv(key, 10)).toBe(10);

        process.env[key] = 'abc';
        expect(resolvePositiveIntEnv(key, 10)).toBe(10);

        process.env[key] = '0';
        expect(resolvePositiveIntEnv(key, 10)).toBe(10);
      } finally {
        if (previous === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = previous;
        }
      }
    });

    it('parses a positive integer from env', () => {
      const key = ENV_KEYS.AUTH_THROTTLE_LIMIT;
      const previous = process.env[key];
      process.env[key] = '25';

      try {
        expect(resolvePositiveIntEnv(key, 10)).toBe(25);
      } finally {
        if (previous === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = previous;
        }
      }
    });
  });

  describe('assertProductionSecret', () => {
    it('throws when secret is missing or empty', () => {
      expect(() =>
        assertProductionSecret(ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET, undefined),
      ).toThrow(/Missing required auth secret/);
      expect(() =>
        assertProductionSecret(ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET, '   '),
      ).toThrow(/Missing required auth secret/);
    });

    it('throws for weak placeholder secrets', () => {
      expect(() =>
        assertProductionSecret(
          ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET,
          'change-me-access-secret',
        ),
      ).toThrow(/Weak placeholder auth secret/);
      expect(() =>
        assertProductionSecret(
          ENV_KEYS.AUTH_REFRESH_TOKEN_SECRET,
          'dev-refresh-secret',
        ),
      ).toThrow(/Weak placeholder auth secret/);
    });

    it('accepts a strong production secret', () => {
      expect(() =>
        assertProductionSecret(
          ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET,
          'prod-super-secret-value-32chars',
        ),
      ).not.toThrow();
    });
  });

  describe('resolveAuthSecret', () => {
    it('returns dev fallback outside production when env is unset', () => {
      const previous = process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET];

      try {
        delete process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET];
        expect(
          resolveAuthSecret(
            ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET,
            'dev-access-secret',
            NODE_ENV.DEVELOPMENT,
          ),
        ).toBe('dev-access-secret');
        expect(
          resolveAuthSecret(
            ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET,
            'dev-access-secret',
            NODE_ENV.TEST,
          ),
        ).toBe('dev-access-secret');
      } finally {
        if (previous === undefined) {
          delete process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET];
        } else {
          process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET] = previous;
        }
      }
    });

    it('uses env value in development when set', () => {
      const previous = process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET];
      process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET] = 'local-dev-secret';

      try {
        expect(
          resolveAuthSecret(
            ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET,
            'dev-access-secret',
            NODE_ENV.DEVELOPMENT,
          ),
        ).toBe('local-dev-secret');
      } finally {
        if (previous === undefined) {
          delete process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET];
        } else {
          process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET] = previous;
        }
      }
    });

    it('throws in production when secret is missing or weak', () => {
      const previous = process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET];

      try {
        delete process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET];
        expect(() =>
          resolveAuthSecret(
            ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET,
            'dev-access-secret',
            NODE_ENV.PRODUCTION,
          ),
        ).toThrow(/Missing required auth secret/);

        process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET] =
          'change-me-access-secret';
        expect(() =>
          resolveAuthSecret(
            ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET,
            'dev-access-secret',
            NODE_ENV.PRODUCTION,
          ),
        ).toThrow(/Weak placeholder auth secret/);
      } finally {
        if (previous === undefined) {
          delete process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET];
        } else {
          process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET] = previous;
        }
      }
    });

    it('returns trimmed env secret in production', () => {
      const previous = process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET];
      process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET] =
        '  prod-super-secret-value-32chars  ';

      try {
        expect(
          resolveAuthSecret(
            ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET,
            'dev-access-secret',
            NODE_ENV.PRODUCTION,
          ),
        ).toBe('prod-super-secret-value-32chars');
      } finally {
        if (previous === undefined) {
          delete process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET];
        } else {
          process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET] = previous;
        }
      }
    });
  });
});
