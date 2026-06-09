import { runInMongoTransaction } from './mongo-transaction.context';

type AsyncMethod = (...args: unknown[]) => Promise<unknown>;

/**
 * Wraps a service method in a MongoDB transaction. Repository writes call
 * {@link getMongoTransactionSession} so they participate without passing `session`.
 */
export function MongoTransaction(): MethodDecorator {
  return (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const original = descriptor.value as AsyncMethod;

    descriptor.value = function (this: unknown, ...args: unknown[]) {
      return runInMongoTransaction(() => original.apply(this, args));
    };

    return descriptor;
  };
}
