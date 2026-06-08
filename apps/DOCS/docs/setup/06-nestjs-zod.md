---
sidebar_position: 6
---

# nestjs-zod on the backend

Wire up [nestjs-zod](https://github.com/BenLorantfy/nestjs-zod) so request query/body/params and response bodies are validated against the shared Zod schemas.

### 6a — Dependencies

Already added in Step 5b. Also install Swagger for OpenAPI docs:

```bash
pnpm add zod nestjs-zod @nestjs/swagger
pnpm approve-builds
```

### 6b — `ZodValidationPipe` and `ZodSerializerInterceptor`

Register both globally in `apps/BE/src/app/app.module.ts`:

```ts
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    // HttpExceptionFilter — see 6c
  ],
})
export class AppModule {}
```

- `ZodValidationPipe` — validates `@Body()`, `@Query()`, and `@Param()` inputs against Zod DTOs
- `ZodSerializerInterceptor` — serializes controller return values through `@ZodResponse` / `@ZodSerializerDto` schemas

### 6c — Exception filters

Add filters under `apps/BE/src/filters/`:

- `http-exception.filter.ts` — maps `ZodSerializationException` to the same `{ statusCode, message, errors }` shape as request validation failures
- `global-exception.filter.ts` — catch-all for unhandled errors (500)

Register both in `app.module.ts`:

```ts
import { GlobalExceptionFilter } from '../filters/global-exception.filter';
import { HttpExceptionFilter } from '../filters/http-exception.filter';

{
  provide: APP_FILTER,
  useClass: HttpExceptionFilter,
},
{
  provide: APP_FILTER,
  useClass: GlobalExceptionFilter,
},
```

### 6d — Swagger + `cleanupOpenApiDoc`

In `apps/BE/src/main.ts`, post-process the OpenAPI document so nestjs-zod DTOs render correctly:

```ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

const openApiDoc = SwaggerModule.createDocument(
  app,
  new DocumentBuilder().setTitle('Quack Auth API').setVersion('1.0').build(),
);
SwaggerModule.setup('docs', app, cleanupOpenApiDoc(openApiDoc));
```

Swagger UI: http://localhost:3000/docs

### 6e — NestJS DTO classes from shared schemas

Keep Zod schemas in `libs/dtos` (shared with FE). In the BE app, wrap them with `createZodDto`:

```ts
// apps/BE/src/app/app.dto.ts
import { createZodDto } from 'nestjs-zod';
import { GreetingQuery, GreetingResponse } from '@shared/dtos';

export class GreetingQueryDto extends createZodDto(GreetingQuery) {}
export class GreetingResponseDto extends createZodDto(GreetingResponse) {}
```

> **Keep `app.dto.ts` in sync.** Adding a schema to `libs/dtos` is not enough for the backend — each schema used in a controller (`@Query()`, `@Body()`, `@ZodResponse()`, etc.) needs a matching `createZodDto` class in `apps/BE/src/app/app.dto.ts` (or a feature-scoped `*.dto.ts` as the API grows). The FE only imports the Zod schema/type from `@shared/dtos`; NestJS validation and OpenAPI require the wrapper on the BE side.

Use in the controller:

```ts
@Get()
@ZodResponse({ type: GreetingResponseDto })
getGreeting(@Query() query: GreetingQueryDto) {
  return this.appService.getGreeting(query.name);
}
```

Example request: `GET /api?name=world` → `{ "name": "world", "appName": "quack-auth" }`
