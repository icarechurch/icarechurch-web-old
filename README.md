# I Care Church Website

The official web platform for **I Care Church**, built to provide church members, visitors, ministry teams, and administrators with a modern way to stay connected with the church community.

The application includes public church information, events, sermons and media, community-facing features, and role-based management tools.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Feature-oriented application architecture

### Backend & Infrastructure

- Supabase
- PostgreSQL
- Supabase Edge Functions
- Supabase Storage
- Leaflet

### Testing

- Cypress
- End-to-end browser testing

---

## Repository Structure

The project is organized into three primary areas:

```text
.
├── icarecenter-frontend/
│   └── src/
│       ├── app/             # Application composition, providers, initialization, and routes
│       ├── domains/         # Business domains, models, APIs, and domain hooks
│       ├── user/            # Public and authenticated user experiences
│       ├── admin/           # Administrator experiences
│       ├── moderator/       # Moderator experiences
│       ├── shared/          # Reusable UI, layouts, hooks, constants, and utilities
│       └── infrastructure/  # Supabase, Storage, Leaflet, and external integrations
│
├── icarecenter-supabase/
│   ├── functions/           # Supabase Edge Functions
│   └── migrations/          # Database schema migrations
│
└── icarecenter-test/
    ├── e2e/                 # Cypress end-to-end tests
    └── support/             # Cypress support files and configuration
```

## Architecture

The frontend separates application composition, business domains, user-facing experiences, shared functionality, and infrastructure integrations.

This structure is intended to:

- Keep business logic separate from presentation and infrastructure concerns.
- Reduce coupling between features.
- Make role-specific functionality easier to maintain.
- Improve testability and long-term scalability.
- Keep reusable functionality centralized without mixing it with domain-specific code.

Role-specific experiences are separated into `user`, `admin`, and `moderator`, while reusable business concepts and integrations remain within `domains`, `shared`, and `infrastructure`.

---

## Getting Started

### Prerequisites

Before running the project locally, make sure you have:

- Node.js
- npm
- Git

A configured Supabase environment may also be required for features that depend on backend services.

### Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### Install Dependencies

Install the frontend dependencies:

```bash
cd icarecenter-frontend
npm install
```

### Start the Development Server

You can start the application from either the repository root or the frontend directory:

```bash
npm run dev
```

When executed from the repository root, the command delegates to `icarecenter-frontend`.

---

## Testing

End-to-end tests are maintained under:

```text
icarecenter-test/
```

The Cypress test suite contains browser-level tests for important application workflows and integrations.

Refer to the project's development documentation for the current testing procedures and environment requirements.

---

## Supabase

Supabase-related backend resources are located under:

```text
icarecenter-supabase/
```

### Edge Functions

```text
icarecenter-supabase/functions/
```

Contains server-side Supabase Edge Functions used by the application.

### Database Migrations

```text
icarecenter-supabase/migrations/
```

Contains version-controlled database migrations used to maintain the application's PostgreSQL schema.

---

## Documentation

Additional development documentation can be found in:

```text
Documentations/DEVELOPMENT.md
```

For common development issues, see:

```text
Documentations/DEVELOPMENT.md#troubleshooting
```

---

## Development Guidelines

When contributing to the project:

1. Keep business logic within the appropriate domain or application layer.
2. Avoid placing domain-specific functionality inside `shared`.
3. Keep infrastructure-specific code isolated under `infrastructure`.
4. Maintain clear boundaries between user, moderator, and administrator experiences.
5. Add or update tests when changing critical application behavior.
6. Keep database changes reproducible through migrations.

---

## Security

Do not commit credentials, API keys, service-role keys, private configuration, or production secrets to the repository.

Environment-specific configuration should be provided through the appropriate environment variables and deployment configuration.

If a security issue is discovered, avoid publishing sensitive exploit details in a public issue.

---

## Project Status

I Care Church Website is under active development and maintenance.

Features, architecture, and documentation may change as the needs of the church and its ministries evolve.

---

## Purpose

This project exists to support the digital ministry and operations of I Care Church by providing a reliable, maintainable, and accessible platform for the church community.

---

**Made with ❤️ for the church community.**