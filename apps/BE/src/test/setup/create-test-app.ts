import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { dbClient } from '@quack/mongoose/client';
import { AppModule } from '../../app/app.module';
import { configureApp } from '../../config/configure-app';

/** Ensures `@quack/mongoose` models share a live connection before `MongooseModule` boots. */
export async function createTestApp(): Promise<INestApplication> {
  await dbClient();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication({ bodyParser: false });
  configureApp(app);
  await app.init();

  return app;
}
