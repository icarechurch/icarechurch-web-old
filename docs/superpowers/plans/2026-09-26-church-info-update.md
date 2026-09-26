# Church Info Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans (inline execution selected). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make the existing frontend `church-info/update` save request work through the `content-data` Edge Function.

**Architecture:** Extend the existing church-info module without changing the frontend request or response envelope. The repository will persist an update by id, the application use case will delegate the operation, the controller will expose it, and the content router will dispatch `church-info/update` alongside the existing `get` operation.

**Tech Stack:** Supabase Edge Functions, Deno, TypeScript, `@supabase/supabase-js`.

## Global Constraints

- Preserve the existing `{ resource, operation, input? }` request and `{ data }`/`{ error }` response envelopes.
- Preserve existing user changes and modify only files required for church-info update behavior and this plan.
- Add tests before production implementation and verify the failing test before writing implementation code.
- Run the affected Deno Edge Function tests and frontend type/lint checks before claiming completion.

---

### Task 1: Add the failing church-info update contract test

**Files:**
- Modify: `supabase/functions/modules/content/content-data.test.ts`

**Interfaces:**
- Consumes: `createContentModule`, `dispatchContentRequest`, and the existing fake Supabase client.
- Produces: A regression assertion that `church-info/update` is a reachable content operation.

- [x] **Step 1: Add one failing dispatcher test**

Add a test after the existing public route dispatch test:

```ts
Deno.test("dispatches a church-info update through the public module surface", async () => {
  const routes = createContentModule(
    createFakeClient({ data: { id: "church-1", name: "Updated iCare" }, error: null }),
  );
  const result = await dispatchContentRequest(
    {
      resource: "church-info",
      operation: "update",
      input: { id: "church-1", name: "Updated iCare" },
    },
    routes,
  );

  if (!result || typeof result !== "object" || !("id" in result)) {
    throw new Error("The church-info update route was not dispatched");
  }
});
```

- [x] **Step 2: Run the focused test and verify the expected failure**

Run:

```powershell
deno test -A supabase/functions/modules/content/content-data.test.ts
```

Expected failure: the new test throws `Unsupported content operation: church-info/update` because the route currently exposes only `church-info/get`.

### Task 2: Implement the church-info update path

**Files:**
- Create: `supabase/functions/modules/content/church-info/application/UpdateChurchInfo.ts`
- Modify: `supabase/functions/modules/content/church-info/domain/ports/ChurchInfoRepository.ts`
- Modify: `supabase/functions/modules/content/church-info/infrastructure/SupabaseChurchInfoRepository.ts`
- Modify: `supabase/functions/modules/content/church-info/presentation/ChurchInfoController.ts`
- Modify: `supabase/functions/modules/content/index.ts`

**Interfaces:**
- Consumes: `{ id: string } & Record<string, unknown>` from the content router.
- Produces: `UpdateChurchInfo.execute(input): Promise<unknown | null>`, repository `update(input): Promise<unknown | null>`, controller `update(input): Promise<unknown | null>`, and the public `church-info/update` route.

- [x] **Step 1: Add the application use case**

Create `UpdateChurchInfo.ts`:

```ts
import type { ChurchInfoRepository } from "../domain/ports/ChurchInfoRepository.ts";

export class UpdateChurchInfo {
  constructor(private readonly repository: ChurchInfoRepository) {}

  execute(input: { id: string } & Record<string, unknown>): Promise<unknown | null> {
    return this.repository.update(input);
  }
}
```

- [x] **Step 2: Extend the repository port and implementation**

Add `update(input: { id: string } & Record<string, unknown>): Promise<unknown | null>` to the repository interface. In `SupabaseChurchInfoRepository`, remove `id` from the update payload, update `church_info` by `id`, select `CHURCH_INFO_COLUMNS`, and return the single updated row. Propagate Supabase errors unchanged, matching the existing repository style.

- [x] **Step 3: Extend the controller**

Change `ChurchInfoController` to receive both `GetChurchInfo` and `UpdateChurchInfo`, then add:

```ts
update(input: { id: string } & Record<string, unknown>): Promise<unknown | null> {
  return this.updateChurchInfo.execute(input);
}
```

- [x] **Step 4: Wire the route**

Import `UpdateChurchInfo`, construct it with the same repository, and expose:

```ts
"church-info": {
  get: () => churchInfoController.get(),
  update: (input) => churchInfoController.update(asRecordWithId(input)),
},
```

- [x] **Step 5: Run the focused content tests**

Run:

```powershell
deno test -A supabase/functions/modules/content/content-data.test.ts supabase/functions/modules/content/church-info
```

Expected result: all focused tests pass, including the new dispatcher regression test and church-info use-case tests.

### Task 3: Verify the repository change against project gates

**Files:**
- No additional source files.

- [x] **Step 1: Run the complete Edge Function lane**

Run from `icarecenter-frontend`:

```powershell
npm run test:edge
```

Expected result: exit code `0` with no failed Deno tests.

- [x] **Step 2: Run frontend typecheck and Ultracite**

Run from `icarecenter-frontend`:

```powershell
npm run typecheck
npm exec -- ultracite check
```

Expected result: both commands exit `0`.

- [x] **Step 3: Review the diff and preserve unrelated changes**

Run:

```powershell
git diff --check
git status --short
git diff -- supabase/functions/modules/content supabase/functions/modules/content/church-info docs/superpowers/plans/2026-09-26-church-info-update.md
```

Confirm only the planned church-info implementation, its tests, and the plan are included in the task diff; do not stage or alter existing unrelated user changes.
