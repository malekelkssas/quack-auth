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
>
> This split is a recurring pain point for the Developer — shared Zod in `libs/dtos` vs Nest wrappers in `app.dto.ts` (and similar pairs elsewhere) are easy to drift apart.
>
> **[filelinks](https://github.com/Vilancer/filelinks)** is a language-agnostic tool the Developer is building to declare semantic relationships between files (and directories): when a **trigger** path changes, linked **affects** paths are flagged for humans, git hooks, or AI agents. Example direction for this repo:
>
> ```ts
> // filelinks.config.ts (conceptual — not wired up here yet)
> import { defineLinks } from '@filelinks/core';
>
> export default defineLinks([
>   {
>     trigger: 'libs/dtos/**',
>     affects: [
>       {
>         file: 'apps/BE/src/app/app.dto.ts',
>         reason:
>           'Add or update createZodDto wrapper for each new shared schema',
>       },
>     ],
>     severity: 'error',
>     agent: {
>       runPolicy: 'trigger-only',
>       provider: 'cursor',
>       runtime: 'local',
>       model: 'composer-2.5',
>       // Optional per-link prompt — agent is spawned to fix affects when trigger is staged
>     },
>   },
> ]);
> ```
>
> **`filelinks check`** compares **staged** files to those links and reports violations (exit **1** on `severity: 'error'`). Husky or CI can run it alongside `pnpm check`.
>
> **`filelinks check --run-agents`** (v1.1+) goes further: when a staged file matches a link’s **trigger**, filelinks can **spawn a Cursor agent** with the link’s prompt (and optional `systemPrompt`, `reason` from affects) so the agent updates the **affects** files — e.g. add the missing `createZodDto` wrapper after you change `libs/dtos`. Run policy defaults to **`trigger-only`** (agent runs when the trigger side is staged); **`trigger-or-affects`** is also available. See [filelinks README → Running agents](https://github.com/Vilancer/filelinks#running-agents-v11).
>
> The [filelinks README](https://github.com/Vilancer/filelinks#) shows `pnpm add -D filelinks @filelinks/core` — **the package is not published on npm yet**; install from the repo (clone / `file:` / local build) until a release is available.

Use in the controller:

```ts
@Get()
@ZodResponse({ type: GreetingResponseDto })
getGreeting(@Query() query: GreetingQueryDto) {
  return this.appService.getGreeting(query.name);
}
```

Example request: `GET /api?name=world` → `{ "name": "world", "appName": "quack-auth" }`
