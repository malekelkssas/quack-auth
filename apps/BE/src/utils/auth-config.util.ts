import { ENV_KEYS, NODE_ENV } from '@shared/constants';

const WEAK_SECRET_PATTERNS = [/^change-me-/i, /^dev-.*-secret$/i] as const;

export function assertProductionSecret(
  envKey: string,
  secret: string | undefined,
): void {
  const trimmed = secret?.trim();
  if (!trimmed) {
    throw new Error(`Missing required auth secret in production: ${envKey}`);
  }

  if (WEAK_SECRET_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    throw new Error(
      `Weak placeholder auth secret not allowed in production: ${envKey}`,
    );
  }
}

export function resolvePositiveIntEnv(
  envKey: string,
  fallback: number,
): number {
  const raw = process.env[envKey]?.trim();
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function resolveAuthSecret(
  envKey: string,
  devFallback: string,
  nodeEnv: string = process.env[ENV_KEYS.NODE_ENV] ?? NODE_ENV.DEVELOPMENT,
): string {
  const raw = process.env[envKey];

  if (nodeEnv === NODE_ENV.PRODUCTION) {
    assertProductionSecret(envKey, raw);
    const trimmed = raw?.trim();
    if (!trimmed) {
      throw new Error(`Missing required auth secret in production: ${envKey}`);
    }
    return trimmed;
  }

  return raw?.trim() ? raw.trim() : devFallback;
}
