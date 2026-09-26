# Edge Function Modular Monolith Boundaries

## Goal

Refactor the Supabase Edge Function backend toward the MeatLens module-first
architecture while preserving the existing deployed function names and API
envelopes. Each change must remain within one owning module. Private
submodules are allowed when they belong to that module and are exposed only
through the module's composition surface.

The first implementation slice is the `content` module. Other modules will be
migrated in separate slices and will not be changed as incidental cleanup.

## Non-goals

- Do not merge all Edge Functions into one deployable function.
- Do not create one deployable function per CRUD resource.
- Do not move business logic into `_shared`.
- Do not change frontend contracts, database behavior, authentication policy,
  or response envelopes unless a module-specific migration requires it.
- Do not refactor `analytics`, `identity`, `audit`, or `livestream` during the
  initial `content` slice.

## Module ownership

The module is the unit of business ownership, implementation, testing, and
change:

```text
functions/modules/
  content/
    sermons/
        domain/
        application/
        infrastructure/
        presentation/
    events/
        domain/
        application/
        infrastructure/
        presentation/
    ministries/
        domain/
        application/
        infrastructure/
        presentation/
    church-info/
        domain/
        application/
        infrastructure/
        presentation/
    gallery/
        domain/
        application/
        infrastructure/
        presentation/
    pastors/
        domain/
        application/
        infrastructure/
        presentation/
    service-times/
        domain/
        application/
        infrastructure/
        presentation/
    giving/
        domain/
        application/
        infrastructure/
        presentation/
    event-popup/
        domain/
        application/
        infrastructure/
        presentation/
    index.ts
```

The resource directories above are private submodules. They may contain their
own domain rules, ports, use cases, repositories, controllers, and tests, but
they must not be imported directly by another top-level module or by an Edge
Function entrypoint.

The `content` root should contain only `index.ts` unless `content` itself owns
cross-submodule business behavior. Do not create empty parent layer
directories or add `.gitkeep` files to represent unused layers.

The public surface is `modules/content/index.ts`. It exposes only the
composition factory and the types required by the function adapter.

If an operation requires behavior from two business modules, it must not reach
into both modules' internals. Either the behavior belongs in one owning module
or it becomes an explicit orchestration module with its own use case and
contract.

## Layer responsibilities

### Domain

Pure business concepts, invariants, entities, value objects, errors, and ports.
No Deno globals, HTTP types, environment reads, Supabase imports, or database
query syntax.

### Application

One use-case class per operation. Each class exposes one public `execute`
method and depends only on domain ports and application types. It coordinates
business behavior but does not know how Supabase persists data.

### Infrastructure

Supabase repositories, storage adapters, external providers, configuration
readers, and concrete implementations of domain ports. All direct `.from()`,
`.rpc()`, service-role client construction, and secret access stay here.

### Presentation

Edge-compatible controllers and operation registries. Presentation converts
validated function requests into use-case inputs and converts results into the
existing response envelope. It does not access Supabase directly.

### Function adapter

Each deployed function keeps a thin `index.ts` that handles the platform
boundary: CORS, request parsing, auth mode, request-scoped composition, and
`Deno.serve`. It delegates immediately to the module's presentation surface.

## Shared kernel

`functions/_shared` is restricted to technical cross-cutting concerns:

```text
_shared/
  application/       # generic Result and pagination primitives
  domain/            # generic errors only
  infrastructure/    # Supabase client factories and runtime config
  presentation/      # request, response, CORS, and error adapters
```

Shared code must not contain sermons, users, analytics, livestream, or other
business policies. A shared helper that needs business vocabulary belongs in
the owning module instead.

No directory is created merely to make the tree look complete. If a layer has
no source files, the layer directory is omitted and no `.gitkeep` placeholder
is added.

## Dependency rules

The architecture test suite will enforce:

1. Domain never imports infrastructure or presentation.
2. Application never imports Supabase, Deno, or persistence methods.
3. Presentation never calls `.from()` or `.rpc()`.
4. Top-level Edge Function entrypoints import module composition surfaces, not
   private submodules.
5. Cross-module imports use the other module's `index.ts` only.
6. Every top-level module exposes `index.ts`.
7. Application use-case classes expose exactly one public `execute` operation.
8. Environment and secret reads occur only in approved runtime/infrastructure
   files.
9. Tests for a module live under that module or the module test root; tests do
   not require another module's infrastructure to exercise a use case.

## Content function mapping

The existing `content-data` Edge Function remains the deployable adapter. Its
current resource operations move behind the `content` module:

```text
content-data/index.ts
  -> modules/content/index.ts
    -> modules/content/sermons/presentation/SermonController.ts
      -> modules/content/sermons/application/ListSermons.ts
        -> modules/content/sermons/domain/ports/SermonRepository.ts
          <- modules/content/sermons/infrastructure/SupabaseSermonRepository.ts
```

The public request shape and `{ data: ... }` / `{ error: ... }` envelopes remain
unchanged. The migration is architectural, not an API redesign.

## Documentation impact

Every module migration must update the repository documentation that describes
the affected structure or boundary. For the initial `content` slice, review
and update the applicable sections of:

- `documentations/ARCHITECTURE.md` for module ownership and dependency flow;
- `documentations/COMPONENTS.md` for Edge Function and content-module roles;
- `documentations/API.md` for the unchanged function contract and operation
  mapping;
- `documentations/DEVELOPMENT.md` for local tests, architecture checks, and
  module-scoped development workflow;
- `documentations/SECURITY.md` for secret, client, RLS, and service-role
  boundaries;
- `README.md` or other project entrypoint documentation when it describes the
  old function layout.

Documentation must describe only directories and files that actually exist.
It must not prescribe empty layer folders, placeholder files, or speculative
future modules. Documentation changes stay in the same module migration
commit/scope and are verified for stale path references before completion.

## Testing and CI

Each content submodule will retain or gain:

- unit tests for domain rules and use cases with in-memory fakes;
- repository tests for Supabase adapter mapping and error behavior;
- function contract tests for request dispatch and response envelopes;
- architecture tests for imports, exports, and layer boundaries.

The content slice must pass the existing Edge Function test lane and the new
architecture checks before the next module is started. No skipped or focused
tests may satisfy the gate.

## Migration sequence

1. Add architecture rules and shared boundary types without changing runtime
   behavior.
2. Create the `content` module composition surface.
3. Migrate one content submodule at a time, beginning with sermons.
4. Route `content-data` through the migrated module while preserving its API.
5. Remove only the superseded content implementation after contract tests pass.
6. Update and review all affected repository documentation.
7. Verify the complete content, documentation, and architecture lanes.
8. Stop and review before planning the next top-level module.

## References

- Supabase Edge Function testing: https://supabase.com/docs/guides/functions/unit-test
- Supabase function dependencies: https://supabase.com/docs/guides/functions/dependencies
- Supabase Edge Function limits: https://supabase.com/docs/guides/functions/limits
