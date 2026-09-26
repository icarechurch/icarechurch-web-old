# Database Migrations Documentation

This document provides a comprehensive guide to the Supabase database migrations used in the iCare Church Website.

## Table of Contents

- [Overview](#overview)
- [Migration Naming Convention](#migration-naming-convention)
- [How to Run Migrations](#how-to-run-migrations)
- [Migration Timeline](#migration-timeline)
- [Core Tables](#core-tables)
- [Supporting Functions](#supporting-functions)
- [Role-Based Access Control](#role-based-access-control)
- [Creating New Migrations](#creating-new-migrations)
- [Rollback Considerations](#rollback-considerations)

## Overview

The iCare Church Website uses Supabase as its database backend. All database schema changes are managed through SQL migration files stored in `supabase/migrations/`. These migrations are executed in chronological order based on their timestamp prefix.

### Key Principles

1. **Immutable Migrations**: Once deployed, migrations should never be modified
2. **Forward-Only**: Each migration builds upon previous ones
3. **RLS Enabled**: All tables have Row Level Security enabled by default
4. **Role-Based Access**: Access controlled via `has_role()` function

## Migration Naming Convention

Migrations follow this naming pattern:

```
YYYYMMDDHHMMSS_description.sql
```

**Examples:**
- `20251204021500_initial_schema.sql` - Initial database setup
- `20251207000000_add_gallery_table.sql` - Feature addition
- `20251207120000_fix_gallery_security.sql` - Security fix

## How to Run Migrations

### Using Supabase Dashboard

1. Navigate to your Supabase project → **SQL Editor**
2. Open the migration file and copy its contents
3. Run the SQL in the editor
4. Verify the changes in **Table Editor**

### Using Supabase CLI

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Run all pending migrations
supabase db push

# Run migrations with confirmation
supabase db push --confirm
```

### Recommended Order

Run migrations in chronological order based on their timestamp prefix. The first migration (`20251204021500_*`) must be run first as it creates core tables and functions.

## Migration Timeline

### Initial Setup (December 4, 2024)

| Migration | Description |
|-----------|-------------|
| `20251204021500_*.sql` | Initial schema with core tables: ministries, events, service_times, church_info, user_roles |
| `20251205045756_*.sql` | Additional initial configuration |

### Analytics System (December 5, 2024)

| Migration | Description |
|-----------|-------------|
| `20251205120000_website_analytics.sql` | Create analytics_visits, analytics_daily_stats, analytics_overall_stats tables |
| `20251205120001_fix_analytics_trigger.sql` | Fix analytics update trigger |
| `20251205120002_fix_analytics_function.sql` | Fix analytics aggregation function |
| `20251205120003_fix_column_ambiguity.sql` | Resolve column name conflicts |

### Feature Additions (December 5-6, 2024)

| Migration | Description |
|-----------|-------------|
| `20251205130000_add_event_status.sql` | Add status column to events table (scheduled/postponed/done) |
| `20251205140000_add_sermons_table.sql` | Create sermons table with all metadata fields |
| `20251206000000_add_giving_settings.sql` | Create giving_settings table for donation configuration |

### Gallery System (December 7-8, 2024)

| Migration | Description |
|-----------|-------------|
| `20251207000000_add_gallery_table.sql` | Create gallery_images table and storage bucket |
| `20251207120000_fix_gallery_security.sql` | Restrict gallery access to admin role only |
| `20251208000000_enforce_gallery_limit.sql` | Add 15-image limit enforcement |
| `20251208000001_fix_low_risk_vulns.sql` | Additional security fixes |

### Ministry Categories (December 12, 2024)

| Migration | Description |
|-----------|-------------|
| `20251212180000_add_ministry_category.sql` | Add category column to ministries (ministry/outreach) |

### RBAC System (December 14, 2024)

| Migration | Description |
|-----------|-------------|
| `20251214000000_rbac_and_users.sql` | Add moderator role to app_role enum |
| `20251214000001_rbac_policies.sql` | Create profiles table, update policies for moderator access |
| `20251214000002_admin_update_profiles.sql` | Allow admins to update user profiles |
| `20251214000003_admin_delete_user_function.sql` | Add function for admins to delete users |

### Moderator Access (December 19, 2024)

| Migration | Description |
|-----------|-------------|
| `20251219160000_allow_moderator_analytics.sql` | Grant analytics read access to moderators |

### Storage Fixes (December 21, 2024)

| Migration | Description |
|-----------|-------------|
| `20251221000000_fix_gallery_storage_policies.sql` | Fix gallery storage bucket policies |

### Pastors Table (December 26, 2024)

| Migration | Description |
|-----------|-------------|
| `20251226000000_add_pastors_table.sql` | Create pastors table with bio, image, and contact fields |

## Core Tables

### Tables Created

| Table | Migration | Purpose |
|-------|-----------|---------|
| `user_roles` | Initial | Store user role assignments |
| `ministries` | Initial | Church ministries and programs |
| `events` | Initial | Church events with scheduling |
| `service_times` | Initial | Weekly service schedule |
| `church_info` | Initial | Church contact information (single row) |
| `sermons` | 20251205140000 | Sermon recordings and metadata |
| `giving_settings` | 20251206000000 | Donation/giving configuration |
| `gallery_images` | 20251207000000 | Photo gallery entries |
| `analytics_visits` | 20251205120000 | Page view tracking |
| `analytics_daily_stats` | 20251205120000 | Aggregated daily analytics |
| `analytics_overall_stats` | 20251205120000 | Overall site statistics |
| `profiles` | 20251214000001 | User profile information |
| `pastors` | 20251226000000 | Pastor profiles and contact info |

### Storage Buckets

| Bucket | Migration | Purpose |
|--------|-----------|---------|
| `gallery` | 20251207000000 | Gallery image storage |
| `church-images` | 20251214000001 | General church image storage |

## Supporting Functions

### `has_role(user_id UUID, role app_role)`

**Created in:** Initial migration

Checks if a user has a specific role. Used in RLS policies throughout the application.

```sql
-- Example usage in policy
USING (public.has_role(auth.uid(), 'admin'))
```

### `update_updated_at_column()`

**Created in:** Initial migration

Trigger function to automatically update `updated_at` timestamp on row updates.

### `handle_new_user()`

**Created in:** RBAC migration

Automatically creates a profile entry when a new user signs up.

### `update_daily_analytics_stats()`

**Created in:** Analytics migration

Trigger function to update daily and overall analytics when a new visit is recorded.

### `get_analytics_summary(days_back INTEGER)`

**Created in:** Analytics migration

Returns analytics summary for the specified number of days.

## Role-Based Access Control

### Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `admin` | Full access | All CRUD operations, user management, analytics |
| `moderator` | Content management | CRUD on content tables, gallery, limited analytics |
| `user` | Default role | No special permissions |

### Role Assignment

The `app_role` enum defines available roles:

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
```

Roles are assigned via the `user_roles` table:

```sql
INSERT INTO user_roles (user_id, role) 
VALUES ('user-uuid', 'admin');
```

### Table Access Matrix

| Table | Admin | Moderator | Public |
|-------|-------|-----------|--------|
| ministries | ✅ Full | ✅ Full | 📖 Read |
| events | ✅ Full | ✅ Full | 📖 Read |
| sermons | ✅ Full | ✅ Full | 📖 Read |
| service_times | ✅ Full | ✅ Full | 📖 Read |
| gallery_images | ✅ Full | ✅ Full | 📖 Read |
| church_info | ✅ Full | ❌ None | 📖 Read |
| giving_settings | ✅ Full | ❌ None | 📖 Read |
| pastors | ✅ Full | ✅ Full | 📖 Read |
| analytics_* | ✅ Full | 📖 Read | ❌ Insert only |
| user_roles | ✅ Full | ❌ None | ❌ Own only |
| profiles | ✅ Full | 📖 Own | 📖 Own |

## Creating New Migrations

### Step 1: Create Migration File

```bash
# Format: YYYYMMDDHHMMSS_description.sql
touch supabase/migrations/mainstream/20251227000000_add_new_feature.sql
```

### Step 2: Write Migration SQL

```sql
-- Create new table
CREATE TABLE public.new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Anyone can view"
ON public.new_table FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins and Moderators can manage"
ON public.new_table FOR ALL
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
);

-- Add trigger for updated_at
CREATE TRIGGER update_new_table_updated_at
    BEFORE UPDATE ON public.new_table
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### Step 3: Test Locally

Test the migration in a local Supabase instance or a staging project before applying to production.

### Step 4: Apply Migration

Run the migration in your Supabase project's SQL Editor or via CLI.

### Step 5: Update Type Definitions

After adding new tables, update the TypeScript types in `icarecenter-frontend/src/infrastructure/supabase/types.ts`.

## Rollback Considerations

### Important Notes

1. **Supabase doesn't support automatic rollbacks** - You must create a new migration to undo changes
2. **Data loss is possible** - Dropping tables or columns removes data permanently
3. **Test thoroughly** - Always test migrations in a staging environment first

### Manual Rollback Example

To rollback a table creation:

```sql
-- Migration: 20251227000000_add_new_feature.sql (original)
-- Rollback: 20251228000000_rollback_new_feature.sql

-- Drop policies first
DROP POLICY IF EXISTS "Anyone can view" ON public.new_table;
DROP POLICY IF EXISTS "Admins and Moderators can manage" ON public.new_table;

-- Drop trigger
DROP TRIGGER IF EXISTS update_new_table_updated_at ON public.new_table;

-- Drop table
DROP TABLE IF EXISTS public.new_table;
```

### Best Practices

1. **Backup before major changes** - Export data before running destructive migrations
2. **Small, focused migrations** - Each migration should do one thing
3. **Include rollback comments** - Document how to undo the migration
4. **Never modify deployed migrations** - Create new migrations for fixes

---

## Quick Reference

### Adding a Column

```sql
ALTER TABLE public.table_name 
ADD COLUMN new_column TEXT DEFAULT 'default_value';
```

### Modifying a Column

```sql
ALTER TABLE public.table_name 
ALTER COLUMN column_name TYPE TEXT;
```

### Adding an Index

```sql
CREATE INDEX idx_table_column ON public.table_name(column_name);
```

### Updating RLS Policy

```sql
DROP POLICY IF EXISTS "Old policy name" ON public.table_name;
CREATE POLICY "New policy name"
ON public.table_name FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

---

For more information, see:
- [API.md](./API.md) - Database schema details
- [SECURITY.md](./SECURITY.md) - RLS policies documentation
- [Supabase Migrations Docs](https://supabase.com/docs/guides/cli/local-development#database-migrations)
