# Contact Email Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver Contact page submissions to `icarecenter.media@gmail.com` through a Supabase Edge Function using Gmail SMTP, configure the repository handoff for Supabase Auth SMTP, and update public church email data.

**Architecture:** Add a dedicated `contact-message` Supabase Edge Function with validation, an injected `EmailSender` port, and a Gmail SMTP infrastructure adapter. The React Contact page calls it through the existing Supabase function helper and manages pending/success/failure states. A forward-only migration changes only known legacy public church email placeholders.

**Tech Stack:** React 18, TypeScript, Supabase Edge Functions/Deno, `denomailer` SMTP client, Supabase migrations, Cypress, Deno tests, Ultracite, Vite SSR.

## Global Constraints

- The Gmail App Password must never be committed, logged, sent to the browser, or placed in frontend environment variables.
- Supabase Auth custom SMTP handles signup confirmations, password resets, magic links, and invitations.
- The public contact function uses `smtp.gmail.com` on TLS port `465` with `icarecenter.media@gmail.com` as both sender and recipient.
- The visitor email is used only as `Reply-To`; client input never controls the sender or recipient.
- Public contact requests validate required fields, enforce length limits, and support a honeypot field.
- Existing admin, member, and genuinely personal pastor email addresses remain unchanged.
- Every production-code change begins with a failing test and is followed by the smallest relevant local gate.
- Preserve the existing `development` integration branch and leave unrelated `AGENTS.md` changes unstaged.

---

### Task 1: Add contact-message validation and the email-sender port

**Files:**
- Create: `supabase/functions/modules/contact-message/domain/ContactMessage.ts`
- Create: `supabase/functions/modules/contact-message/domain/ports/EmailSender.ts`
- Create: `supabase/functions/modules/contact-message/application/SendContactMessage.ts`
- Create: `supabase/functions/modules/contact-message/application/SendContactMessage.test.ts`

**Interfaces:**
- `ContactMessage` contains trimmed `firstName`, `lastName`, `email`, optional `phone`, `subject`, and `message`.
- `EmailSender.send(message: ContactMessage): Promise<void>` is the only infrastructure dependency.
- `SendContactMessage.execute(input: unknown): Promise<{ sent: true }>` validates input, silently suppresses honeypot submissions, and sends valid messages.

- [ ] **Step 1: Write the failing tests**

Use a fake sender that records calls and can throw. Cover valid trimming, invalid email rejection without a sender call, honeypot suppression, and delivery-error wrapping:

```ts
const validInput = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  phone: "+63 900 000 0000",
  subject: "Prayer request",
  message: "Please pray for our family.",
  website: "",
};

Deno.test("sends a trimmed valid contact message", async () => {
  const sent: ContactMessage[] = [];
  const sender: EmailSender = { async send(message) { sent.push(message); } };
  const result = await new SendContactMessage(sender).execute({
    ...validInput,
    firstName: " Ada ",
  });
  if (JSON.stringify(result) !== JSON.stringify({ sent: true })) {
    throw new Error("Expected a successful send result");
  }
  if (sent[0]?.firstName !== "Ada") throw new Error("Expected trimmed input");
});

Deno.test("rejects invalid input before sending", async () => {
  const sent: ContactMessage[] = [];
  const sender: EmailSender = { async send(message) { sent.push(message); } };
  let rejected = false;
  try {
    await new SendContactMessage(sender).execute({
      ...validInput,
      email: "not-an-email",
    });
  } catch (error) {
    rejected = error instanceof Error && error.name === "ContactValidationError";
  }
  if (!rejected || sent.length !== 0) {
    throw new Error("Invalid input must not reach the sender");
  }
});

Deno.test("does not send honeypot submissions", async () => {
  const sent: ContactMessage[] = [];
  const sender: EmailSender = { async send(message) { sent.push(message); } };
  const result = await new SendContactMessage(sender).execute({
    ...validInput,
    website: "bot-value",
  });
  if (JSON.stringify(result) !== JSON.stringify({ sent: true }) || sent.length) {
    throw new Error("Honeypot input must be silently ignored");
  }
});

Deno.test("wraps sender failures", async () => {
  const sender: EmailSender = {
    async send() { throw new Error("SMTP secret detail"); },
  };
  let errorName = "";
  try {
    await new SendContactMessage(sender).execute(validInput);
  } catch (error) {
    errorName = error instanceof Error ? error.name : "";
  }
  if (errorName !== "ContactDeliveryError") {
    throw new Error("Expected the delivery error boundary");
  }
});
```

- [ ] **Step 2: Verify red**

```powershell
deno test -A supabase/functions/modules/contact-message/application/SendContactMessage.test.ts
```

Expected: failure because the new modules do not exist.

- [ ] **Step 3: Implement the smallest green version**

Define `ContactMessage`, `ContactValidationError`, and `ContactDeliveryError` in the domain. Define `EmailSender` in the port. Implement `SendContactMessage` with these exact maximum lengths: names 80, phone 40, subject 160, message 5,000. Trim all fields, require non-empty names/subject/message, validate email with an anchored pattern, ignore non-empty `website`, and wrap sender failures in `ContactDeliveryError`.

- [ ] **Step 4: Verify green**

Run the focused Deno command again. Expected: all four tests pass with exit code 0.

- [ ] **Step 5: Commit**

```powershell
git add supabase/functions/modules/contact-message
git commit -m "feat: validate contact messages"
```

---

### Task 2: Add the Gmail SMTP Edge Function

**Files:**
- Create: `supabase/functions/modules/contact-message/infrastructure/GmailSmtpEmailSender.ts`
- Create: `supabase/functions/modules/contact-message/presentation/ContactController.ts`
- Create: `supabase/functions/modules/contact-message/presentation/ContactController.test.ts`
- Create: `supabase/functions/modules/contact-message/index.ts`
- Create: `supabase/functions/modules/contact-message/entrypoint.ts`
- Modify: `supabase/config.toml`
- Modify: `supabase/functions/tests/architecture/edge-module-boundaries.test.ts`

**Interfaces:**
- `GmailSmtpEmailSender` implements `EmailSender` and reads `GMAIL_SMTP_USERNAME`, `GMAIL_SMTP_APP_PASSWORD`, and `CONTACT_RECIPIENT_EMAIL`.
- `ContactController.execute(request: FunctionRequest): Promise<{ sent: true }>` accepts only resource `contact-message` and operation `send`.
- The deployed function is `contact-message`, with JWT verification disabled only for this function.

- [ ] **Step 1: Write the failing controller test**

```ts
Deno.test("rejects unsupported operations", async () => {
  const controller = new ContactController({
    async execute() { return { sent: true }; },
  });
  let error: unknown;
  try {
    await controller.execute({
      resource: "church-info",
      operation: "get",
      input: {},
    });
  } catch (caught) {
    error = caught;
  }
  if (!(error instanceof HttpError) || error.code !== "INVALID_OPERATION") {
    throw new Error("Expected a stable invalid-operation error");
  }
});
```

Also add a missing-secrets adapter test; it must fail as `ContactDeliveryError` without opening a network connection.

- [ ] **Step 2: Verify red**

```powershell
deno test -A supabase/functions/modules/contact-message/presentation/ContactController.test.ts
```

Expected: failure because the controller and adapter are absent.

- [ ] **Step 3: Implement the adapter and controller**

Use `SMTPClient` from `https://deno.land/x/denomailer/mod.ts`. Construct it with `smtp.gmail.com`, port `465`, `tls: true`, and the two Gmail secrets. Send:

```ts
await client.send({
  from: username,
  to: recipient,
  replyTo: message.email,
  subject: `[Website Contact] ${message.subject}`,
  content: [
    `Name: ${message.firstName} ${message.lastName}`,
    `Email: ${message.email}`,
    `Phone: ${message.phone || "Not provided"}`,
    "",
    message.message,
  ].join("\n"),
});
```

Always close the client. Convert missing configuration and provider failures to `ContactDeliveryError` without retaining provider text. Map validation to `HttpError(400, "INVALID_CONTACT_MESSAGE", "Please check your message and try again")` and delivery errors to `HttpError(502, "CONTACT_MESSAGE_SEND_FAILED", "Unable to send your message right now")`.

Follow the existing livestream entrypoint pattern: handle OPTIONS with `createOptionsResponse`, parse the shared request, call the controller, and use `ok`/`failFromError`. Wire the module in `index.ts`.

- [ ] **Step 4: Register the function and architecture boundary**

Add this exact block to `supabase/config.toml`:

```toml
[functions.contact-message]
entrypoint = "./functions/modules/contact-message/entrypoint.ts"
verify_jwt = false
```

Add `contact-message` to the module roots, deployment-entrypoint map, and legacy-directory checks in the architecture test. Keep application/domain/presentation files free of Deno, Supabase, fetch, and SMTP imports.

- [ ] **Step 5: Verify green**

```powershell
deno test -A supabase/functions/modules/contact-message
deno test -A supabase/functions/tests/architecture/edge-module-boundaries.test.ts
```

Expected: all contact and edge-boundary tests pass.

- [ ] **Step 6: Commit**

```powershell
git add supabase/config.toml supabase/functions/modules/contact-message supabase/functions/tests/architecture/edge-module-boundaries.test.ts
git commit -m "feat: add Gmail contact message function"
```

---

### Task 3: Connect the React Contact page

**Files:**
- Create: `icarecenter-frontend/src/domains/contact/model/contact.types.ts`
- Create: `icarecenter-frontend/src/domains/contact/api/contact.api.ts`
- Modify: `icarecenter-frontend/src/user/contact/pages/ContactPage.tsx`
- Create: `icarecenter-test/e2e/contact/contact.cy.js`

**Interfaces:**
- `ContactMessageInput` contains the six visible fields plus `website`.
- `contactApi.sendMessage(input): Promise<{ sent: true }>` invokes `contact-message` with resource `contact-message` and operation `send`.

- [ ] **Step 1: Write the failing Cypress tests**

Intercept `**/functions/v1/contact-message`, assert the request input includes the filled values, reply with `{ data: { sent: true } }`, and assert a success message. Add a second test replying with 502 and assert the error is visible while the entered message remains.

```js
cy.intercept("POST", "**/functions/v1/contact-message", (request) => {
  expect(request.body.input).to.include({
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    subject: "Prayer request",
    message: "Please pray for our family.",
  });
  request.reply({ statusCode: 200, body: { data: { sent: true } } });
}).as("sendContactMessage");
```

- [ ] **Step 2: Verify red**

```powershell
npx cypress run --config-file icarecenter-test/cypress.config.cjs --spec icarecenter-test/e2e/contact/contact.cy.js
```

Expected: failure because the current form reports success without making an API call.

- [ ] **Step 3: Implement the API and UI behavior**

Use this API implementation:

```ts
export const contactApi = {
  sendMessage(input: ContactMessageInput) {
    return invokeFunction<{ sent: true }>("contact-message", {
      resource: "contact-message",
      operation: "send",
      input,
    });
  },
};
```

Make `handleSubmit` async, track `isSubmitting` and status, call `contactApi.sendMessage`, clear only after success, preserve values after failure, remove `Coming soon!`, add `name` and label `htmlFor`/input `id` pairs, add the hidden `website` honeypot, disable the button during delivery, and expose status with `aria-live="polite"`.

- [ ] **Step 4: Verify green and run frontend checks**

```powershell
npx cypress run --config-file icarecenter-test/cypress.config.cjs --spec icarecenter-test/e2e/contact/contact.cy.js
npm --prefix icarecenter-frontend run typecheck
npm --prefix icarecenter-frontend exec -- ultracite check
```

Expected: both Cypress tests and both frontend checks pass.

- [ ] **Step 5: Commit**

```powershell
git add icarecenter-frontend/src/domains/contact icarecenter-frontend/src/user/contact/pages/ContactPage.tsx icarecenter-test/e2e/contact/contact.cy.js
git commit -m "feat: send contact form messages"
```

---

### Task 4: Update public email data and deployment/security docs

**Files:**
- Create: `supabase/migrations/mainstream/20260926000000_set_public_church_email.sql`
- Create: `supabase/migrations/mainstream/20260926000000_set_public_church_email.test.ts`
- Modify: `documentations/DEPLOYMENT.md`
- Modify: `documentations/SECURITY.md`

- [ ] **Step 1: Write the migration assertion first**

Add a migration test that fails until a file exists containing the new email, a `church_info.email` update, a conditional `pastor@icarerefuge.org` replacement, and no broad unconditional overwrite of all pastor emails.

- [ ] **Step 2: Verify red**

```powershell
deno test -A supabase/migrations/mainstream/20260926000000_set_public_church_email.test.ts
```

Expected: failure because the migration test and migration do not yet exist.

- [ ] **Step 3: Add the forward-only migration**

Keep existing migrations immutable and create:

```sql
UPDATE public.church_info
SET email = 'icarecenter.media@gmail.com',
    pastor_email = CASE
      WHEN pastor_email = 'pastor@icarerefuge.org'
        THEN 'icarecenter.media@gmail.com'
      ELSE pastor_email
    END,
    updated_at = now()
WHERE email IS DISTINCT FROM 'icarecenter.media@gmail.com'
   OR pastor_email = 'pastor@icarerefuge.org';

UPDATE public.pastors
SET email = 'icarecenter.media@gmail.com', updated_at = now()
WHERE email = 'pastor@icarerefuge.org';
```

- [ ] **Step 4: Document external setup**

Document Supabase Auth SMTP as host `smtp.gmail.com`, port `465`, username/sender `icarecenter.media@gmail.com`, and the Gmail App Password entered only in Supabase. Document Edge Function secrets `GMAIL_SMTP_USERNAME`, `GMAIL_SMTP_APP_PASSWORD`, and `CONTACT_RECIPIENT_EMAIL`, with recipient value `icarecenter.media@gmail.com`. Document the fixed sender/recipient, `Reply-To`, validation, and generic provider errors in the security guide. Do not write a secret value.

- [ ] **Step 5: Verify and commit**

```powershell
git diff --check
deno test -A supabase/functions/tests/architecture
git add supabase/migrations/mainstream/20260926000000_set_public_church_email.sql documentations/DEPLOYMENT.md documentations/SECURITY.md
git commit -m "chore: update public church email delivery setup"
```

Expected: migration/architecture checks pass and only the approved files are committed.

---

### Task 5: Run the complete local CI gate and hand off secrets

**Files:** Modify only already-scoped files if verification reveals a real defect.

- [ ] **Step 1: Check the final diff**

```powershell
git status --short --branch
git diff master..development --stat
git diff --check
```

Expected: the pre-existing `AGENTS.md` change remains unstaged and all other changes are limited to the approved design, plan, contact function, frontend integration, migration, and docs.

- [ ] **Step 2: Run the complete relevant local gates**

```powershell
npm --prefix icarecenter-frontend run typecheck
npm --prefix icarecenter-frontend exec -- ultracite doctor
npm --prefix icarecenter-frontend exec -- ultracite check
npm --prefix icarecenter-frontend run test:ssr
npm --prefix icarecenter-frontend run test:edge
npm --prefix icarecenter-frontend run test:architecture -- --config trashAssetsBeforeRuns=false
npm --prefix icarecenter-frontend run build:ssr
```

Expected: every command exits 0. Run the focused Contact Cypress spec with Vite running if it is not included in the selected browser lane.

- [ ] **Step 3: Provide the external configuration handoff**

The operator sets these values locally, never in source:

```powershell
supabase secrets set GMAIL_SMTP_USERNAME=icarecenter.media@gmail.com
supabase secrets set GMAIL_SMTP_APP_PASSWORD=<paste-the-app-password-locally>
supabase secrets set CONTACT_RECIPIENT_EMAIL=icarecenter.media@gmail.com
supabase functions deploy contact-message
supabase db push
```

The operator also configures Supabase Dashboard → Authentication → SMTP Settings with the same Gmail host, port, username, App Password, and sender.

- [ ] **Step 4: Report exact verification**

If a correction is needed, rerun its failing test and the complete relevant gate before committing. Report command exit codes and clearly identify external Supabase/Auth configuration that could not be verified from the repository.
