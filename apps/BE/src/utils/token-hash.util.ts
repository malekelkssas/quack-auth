import { createHmac, timingSafeEqual } from 'node:crypto';

export function hashRefreshToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('hex');
}

export function verifyRefreshTokenHash(
  token: string,
  storedHash: string,
  secret: string,
): boolean {
  const computed = hashRefreshToken(token, secret);

  try {
    const computedBuffer = Buffer.from(computed, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    if (computedBuffer.length !== storedBuffer.length) {
      return false;
    }

    return timingSafeEqual(computedBuffer, storedBuffer);
  } catch {
    return false;
  }
}
