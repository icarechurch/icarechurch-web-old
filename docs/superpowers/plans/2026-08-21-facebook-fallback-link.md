# Facebook Fallback Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secure Facebook page link to the YouTube livestream’s offline and error fallback state.

**Architecture:** Keep the fallback links local to `YouTubeLivestream`. Render the new Facebook link beside the existing YouTube link only when no live iframe is rendered.

**Tech Stack:** React, TypeScript, Cypress, Vite.

## Global Constraints

- Preserve the existing YouTube live iframe behavior.
- Use the public Facebook page URL `https://www.facebook.com/icarecenter`.
- External links must use `target="_blank"` and `rel="noopener noreferrer"`.
- Follow the repository’s Ultracite/TypeScript conventions.

---

### Task 1: Add and verify the fallback link

**Files:**
- Modify: `src/user/sermons/components/YouTubeLivestream.tsx`
- Test: `cypress/e2e/sermons/youtube-livestream.cy.ts`

**Interfaces:**
- Consumes: The existing `YouTubeLivestream` offline/error rendering branch.
- Produces: A public Facebook link labeled `Visit our Facebook page` in offline/error states.

- [ ] **Step 1: Write the failing test**

Extend the existing offline-state Cypress test with:

```typescript
const facebookUrl = "https://www.facebook.com/icarecenter";

cy.get("#livestream a")
  .contains("Visit our Facebook page")
  .should("have.attr", "href", facebookUrl)
  .and("have.attr", "target", "_blank")
  .and("have.attr", "rel", "noopener noreferrer");
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npx cypress run --spec cypress/e2e/sermons/youtube-livestream.cy.ts --config trashAssetsBeforeRuns=false`

Expected: The offline-state test fails because `Visit our Facebook page` is not present.

- [ ] **Step 3: Write the minimal implementation**

In `YouTubeLivestream.tsx`, add:

```typescript
const FACEBOOK_PAGE_URL = "https://www.facebook.com/icarecenter";
```

Render a second anchor immediately after `ChannelLink` in the fallback container, using the same secure link attributes and the label `Visit our Facebook page`.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npx cypress run --spec cypress/e2e/sermons/youtube-livestream.cy.ts --config trashAssetsBeforeRuns=false`

Expected: All focused YouTube livestream tests pass.

- [ ] **Step 5: Run project verification**

Run: `npm run typecheck` and `npm run test:architecture`.

Expected: Both commands exit with code 0.

- [ ] **Step 6: Commit**

```powershell
git add src/user/sermons/components/YouTubeLivestream.tsx cypress/e2e/sermons/youtube-livestream.cy.ts
git commit -m "feat: add Facebook livestream fallback link"
```
