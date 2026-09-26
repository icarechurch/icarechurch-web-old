# Contact Email Delivery Design

## Goal

Make the public Contact page deliver submitted messages to
`icarecenter.media@gmail.com`, while configuring Supabase Auth to deliver its
real user emails through the same Gmail account. Update the public church
contact email to `icarecenter.media@gmail.com` without changing unrelated
administrator, member, or genuinely personal email addresses.

## Scope

This change has two email paths that share Gmail SMTP credentials but have
different responsibilities:

1. Supabase Auth custom SMTP remains responsible for signup confirmations,
   password resets, magic links, and invitations.
2. A public Supabase Edge Function is responsible for contact-form messages.

The Auth SMTP configuration is a Supabase project setting and cannot be
represented safely in the repository as a password. The repository will
include the exact configuration and secret names required for deployment, but
the Gmail App Password must be entered into Supabase's secret/configuration
systems outside source control.

## Architecture

The Contact page will submit JSON to a dedicated Supabase Edge Function. The
function will use a small email-sender port so the application and controller
can be tested without making a live Gmail connection:

```text
ContactPage
  -> Supabase Function client
  -> contact-message Edge Function
  -> request validation and abuse checks
  -> Gmail SMTP sender
  -> icarecenter.media@gmail.com
```

The Edge Function will use Gmail SMTP over TLS on port 465. It will read the
SMTP username and App Password from Supabase Function Secrets. The sender and
recipient will be configured as `icarecenter.media@gmail.com`; the visitor's
validated email will be used only as `Reply-To`, preventing the form from
spoofing arbitrary sender addresses.

The function will be public because visitors are not authenticated. Its
configuration will disable JWT verification for this function only. It will
retain the repository's standard CORS and response conventions, and the
client will call it through the existing Supabase client rather than exposing
SMTP details in the browser.

## Request contract and validation

The request will contain:

- `firstName`: required, trimmed, bounded text;
- `lastName`: required, trimmed, bounded text;
- `email`: required, valid email address;
- `phone`: optional, bounded text;
- `subject`: required, trimmed, bounded text;
- `message`: required, trimmed, bounded text;
- `website`: an empty honeypot field intended to remain empty for people.

The server will reject malformed JSON, missing fields, invalid email addresses,
overlong values, and non-empty honeypot values. The client will disable the
submit button while delivery is pending, show a success message only after a
successful response, preserve the entered values after failure, and show a
non-sensitive error message when delivery fails.

The function will return a generic error body for SMTP/configuration failures.
It will not return the App Password, SMTP host response, stack trace, or other
provider details. The message body sent to Gmail will include the visitor's
name, contact details, subject, and message in plain text.

## Email configuration

Supabase Auth will be configured with:

- SMTP host: `smtp.gmail.com`;
- SMTP port: `465` with TLS;
- SMTP username: `icarecenter.media@gmail.com`;
- SMTP password: the Gmail App Password;
- sender address/name: the church Gmail account and church name.

The contact Edge Function will use the same account through secrets with
names that are distinct from frontend variables, such as
`GMAIL_SMTP_USERNAME`, `GMAIL_SMTP_APP_PASSWORD`, and
`CONTACT_RECIPIENT_EMAIL`. No secret will be added to `.env` files committed
to the repository.

## Church email data update

The initial church-info seed will use `icarecenter.media@gmail.com`. A new
migration will update the existing public `church_info.email` value and the
legacy `church_info.pastor_email` value only when they still contain the
known placeholder addresses from the initial data. Existing pastor records
will receive the same conditional replacement only for those known legacy
placeholders. Admin, member, auth, and genuinely personal pastor addresses
will not be modified.

This keeps the Contact page, Footer, organization structured data, and other
data-driven public surfaces aligned through the single public church email
field.

## Error handling and abuse resistance

- Invalid requests return a client error with a stable validation code.
- Honeypot submissions return the same public success shape without sending an
  email, avoiding a useful signal to simple bots.
- SMTP failures return a server error with a generic user-facing message and
  retain diagnostic details only in server logs without secrets.
- Input length limits and plain-text email formatting reduce header injection
  and oversized-message risk.
- The function will not trust a client-supplied recipient or sender.

Rate limiting beyond the honeypot and platform-level protections is outside
this change; it can be added later if the public endpoint receives abuse.

## Testing

The implementation will add tests before production code for:

1. valid contact data producing one email with the configured recipient and
   visitor `Reply-To`;
2. invalid and overlong fields being rejected without calling the sender;
3. honeypot submissions returning the non-error response without sending;
4. sender failures being converted to a sanitized error response;
5. the Contact page showing pending, success, and failure states;
6. the email migration replacing only the known legacy placeholders.

The relevant local gates are the existing frontend typecheck, Ultracite
doctor/check, SSR tests, Supabase Edge Function tests, architecture tests,
and SSR production build. The CI workflow remains unchanged and continues to
be the completion gate.

## Deployment handoff

After code is merged, deployment requires these external steps:

1. Enable a Gmail App Password for `icarecenter.media@gmail.com`.
2. Configure Supabase Auth Custom SMTP with the Gmail SMTP settings above.
3. Set the contact-function secrets in Supabase.
4. Deploy the new Edge Function and apply the email migration.
5. Submit a real contact message and test signup/password-reset delivery.

The App Password must not be pasted into source files, chat, commit messages,
or frontend environment variables.
