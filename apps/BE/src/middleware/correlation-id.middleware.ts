import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { runWithCorrelationId } from '../utils/libs/logging/correlation-id.context';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

export function correlationIdMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const incoming = request.headers[CORRELATION_ID_HEADER];
  const correlationId =
    typeof incoming === 'string' && incoming.length > 0
      ? incoming
      : randomUUID();

  response.setHeader(CORRELATION_ID_HEADER, correlationId);
  runWithCorrelationId(correlationId, () => next());
}
