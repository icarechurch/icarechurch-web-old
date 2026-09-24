# API and Data Layer Documentation

This document describes the data layer, API interactions, database schema, and custom hooks used in the iCare Church Website.

## Table of Contents

- [Supabase Configuration](#supabase-configuration)
- [Database Schema](#database-schema)
- [Custom Hooks](#custom-hooks)
- [Row Level Security](#row-level-security)
- [Storage Buckets](#storage-buckets)
- [Data Types](#data-types)
- [Query Patterns](#query-patterns)

## Supabase Configuration

### Client Setup

The Supabase client is configured in `icarecenter-frontend/src/infrastructure/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
```

### Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon/public key

## Database Schema

### Tables Overview

The database consists of the following tables:

1. **ministries** - Church ministries and programs
2. **events** - Church events with status tracking
3. **service_times** - Service schedule
4. **sermons** - Sermon recordings and metadata
5. **giving_settings** - Donation configuration
6. **gallery_images** - Photo gallery (max 15 images)
7. **website_analytics** - Page view tracking
8. **church_info** - Church contact information
9. **pastors** - Pastor profiles with contact info and bios

### Ministries Table

**Table**: `public.ministries`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| name | text | No | - | Ministry name |
| description | text | Yes | null | Ministry description |
| leader | text | Yes | null | Ministry leader name |
| meeting_time | text | Yes | null | Meeting schedule |
| image_url | text | Yes | null | Ministry image URL |
| sort_order | integer | Yes | null | Display order |
| created_at | timestamptz | No | now() | Creation timestamp |
| updated_at | timestamptz | No | now() | Last update timestamp |

**Indexes**: Primary key on `id`

**RLS Policies**:
- Public read access
- Authenticated write access

---

### Events Table

**Table**: `public.events`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| title | text | No | - | Event title |
| description | text | Yes | null | Event description |
| event_date | date | No | - | Event date |
| event_time | text | Yes | null | Event time |
| location | text | Yes | null | Event location |
| image_url | text | Yes | null | Event image URL |
| status | text | No | 'scheduled' | Event status |
| created_at | timestamptz | No | now() | Creation timestamp |
| updated_at | timestamptz | No | now() | Last update timestamp |

**Status Values**: `'scheduled'`, `'postponed'`, `'done'`

**Indexes**: Primary key on `id`

**RLS Policies**:
- Public read access
- Authenticated write access

---

### Service Times Table

**Table**: `public.service_times`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| name | text | No | - | Service name |
| time | text | No | - | Service time |
| description | text | Yes | null | Service description |
| audience | text | Yes | null | Target audience |
| sort_order | integer | Yes | null | Display order |
| created_at | timestamptz | No | now() | Creation timestamp |
| updated_at | timestamptz | No | now() | Last update timestamp |

**Indexes**: Primary key on `id`

**RLS Policies**:
- Public read access
- Authenticated write access

---

### Sermons Table

**Table**: `public.sermons`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| title | text | No | - | Sermon title |
| description | text | Yes | null | Sermon description |
| speaker | text | No | - | Speaker name |
| sermon_date | date | No | - | Sermon date |
| video_url | text | Yes | null | Video URL |
| audio_url | text | Yes | null | Audio URL |
| scripture_reference | text | Yes | null | Bible reference |
| series_name | text | Yes | null | Sermon series |
| thumbnail_url | text | Yes | null | Thumbnail image URL |
| duration_minutes | integer | Yes | null | Duration in minutes |
| is_featured | boolean | No | false | Featured flag |
| created_at | timestamptz | No | now() | Creation timestamp |
| updated_at | timestamptz | No | now() | Last update timestamp |

**Indexes**: Primary key on `id`

**RLS Policies**:
- Public read access
- Authenticated write access

---

### Gallery Images Table

**Table**: `public.gallery_images`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| title | text | No | - | Image title |
| description | text | Yes | null | Image description |
| image_url | text | No | - | Image URL |
| created_at | timestamptz | No | now() | Creation timestamp |

**Constraints**: Maximum 15 images (enforced at application level)

**Indexes**: Primary key on `id`

**RLS Policies**:
- Public read access
- Authenticated write/delete access

---

### Giving Settings Table

**Table**: `public.giving_settings`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| payment_method | text | No | - | Payment method name |
| account_info | text | Yes | null | Account details |
| qr_code_url | text | Yes | null | QR code image URL |
| is_active | boolean | No | true | Active status |
| created_at | timestamptz | No | now() | Creation timestamp |
| updated_at | timestamptz | No | now() | Last update timestamp |

**Indexes**: Primary key on `id`

**RLS Policies**:
- Public read access (active only)
- Authenticated write access

---

### Website Analytics Table

**Table**: `public.website_analytics`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| page_path | text | No | - | Page URL path |
| page_title | text | Yes | null | Page title |
| referrer | text | Yes | null | Referrer URL |
| user_agent | text | Yes | null | Browser user agent |
| visited_at | timestamptz | No | now() | Visit timestamp |

**Indexes**: Primary key on `id`, index on `visited_at`

**RLS Policies**:
- Public insert access (for tracking)
- Authenticated read access (admin only)

---

### Church Info Table

**Table**: `public.church_info`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| pastor_name | text | Yes | null | Pastor name |
| pastor_email | text | Yes | null | Pastor email |
| pastor_phone | text | Yes | null | Pastor phone |
| church_name | text | Yes | null | Church name |
| address | text | Yes | null | Church address |
| office_hours | text | Yes | null | Office hours |
| created_at | timestamptz | No | now() | Creation timestamp |
| updated_at | timestamptz | No | now() | Last update timestamp |

**Indexes**: Primary key on `id`

**RLS Policies**:
- Public read access
- Authenticated write access

---

### Pastors Table

**Table**: `public.pastors`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| name | text | No | - | Pastor name |
| email | text | Yes | null | Pastor email |
| phone | text | Yes | null | Pastor phone |
| title | text | Yes | 'Pastor' | Pastor title (e.g., Senior Pastor) |
| bio | text | Yes | null | Pastor biography |
| image_url | text | Yes | null | Pastor profile image URL |
| sort_order | integer | Yes | 0 | Display order |
| created_at | timestamptz | No | now() | Creation timestamp |
| updated_at | timestamptz | No | now() | Last update timestamp |

**Indexes**: Primary key on `id`

**RLS Policies**:
- Public read access (anon and authenticated)
- Admin and Moderator write access (via `has_role` function)

---

## Custom Hooks

Data fetching hooks are located under `icarecenter-frontend/src/domains/` and call the backend through `icarecenter-frontend/src/infrastructure/supabase/`.

### Ministries Hooks

#### useMinistries()

Fetch all ministries ordered by sort_order.

```typescript
const { data, isLoading, error } = useMinistries();
```

**Returns**: `Ministry[]`

#### useMinistryMutations()

CRUD operations for ministries.

```typescript
const { createMinistry, updateMinistry, deleteMinistry } = useMinistryMutations();

// Create
createMinistry.mutate({
  name: "Youth Ministry",
  description: "For young people",
  leader: "John Doe",
  meeting_time: "Sundays 5pm",
  image_url: "https://...",
  sort_order: 1
});

// Update
updateMinistry.mutate({
  id: "uuid",
  name: "Updated Name"
});

// Delete
deleteMinistry.mutate("uuid");
```

---

### Events Hooks

#### useEvents()

Fetch all events ordered by event_date.

```typescript
const { data, isLoading, error } = useEvents();
```

**Returns**: `Event[]`

#### useEventMutations()

CRUD operations for events.

```typescript
const { createEvent, updateEvent, deleteEvent } = useEventMutations();

// Create
createEvent.mutate({
  title: "Christmas Service",
  description: "Special Christmas celebration",
  event_date: "2024-12-25",
  event_time: "10:00 AM",
  location: "Main Sanctuary",
  status: "scheduled"
});

// Update
updateEvent.mutate({
  id: "uuid",
  status: "done"
});

// Delete
deleteEvent.mutate("uuid");
```

---

### Service Times Hooks

#### useServiceTimes()

Fetch all service times ordered by sort_order.

```typescript
const { data, isLoading, error } = useServiceTimes();
```

**Returns**: `ServiceTime[]`

#### useServiceTimeMutations()

CRUD operations for service times.

```typescript
const {
  createServiceTime,
  updateServiceTime,
  deleteServiceTime,
  updateSortOrder
} = useServiceTimeMutations();

// Create
createServiceTime.mutate({
  name: "Sunday Morning Service",
  time: "10:00 AM",
  description: "Main worship service",
  audience: "All ages",
  sort_order: 1
});

// Update sort order (bulk)
updateSortOrder.mutate([
  { id: "uuid1", sort_order: 1 },
  { id: "uuid2", sort_order: 2 }
]);
```

---

### Sermons Hooks

#### useSermons()

Fetch all sermons ordered by sermon_date (descending).

```typescript
const { data, isLoading, error } = useSermons();
```

**Returns**: `Sermon[]`

#### useLatestSermon()

Fetch the most recent sermon.

```typescript
const { data, isLoading, error } = useLatestSermon();
```

**Returns**: `Sermon | null`

#### useSermonMutations()

CRUD operations for sermons.

```typescript
const { createSermon, updateSermon, deleteSermon } = useSermonMutations();

// Create
createSermon.mutate({
  title: "Walking in Faith",
  description: "A message about faith",
  speaker: "Pastor Michael",
  sermon_date: "2024-12-01",
  video_url: "https://youtube.com/...",
  scripture_reference: "Hebrews 11:1-6",
  series_name: "Faith Series",
  duration_minutes: 45,
  is_featured: true
});
```

---

### Gallery Hooks

#### useGallery()

Fetch all gallery images ordered by created_at (descending).

```typescript
const { data, isLoading, error } = useGallery();
```

**Returns**: `GalleryImage[]`

**Note**: Maximum 15 images enforced at application level.

#### useGalleryMutations()

Upload and delete gallery images.

```typescript
const { uploadImage, deleteImage } = useGalleryMutations();

// Upload
uploadImage.mutate({
  title: "Church Picnic 2024",
  description: "Annual church picnic",
  image_url: "https://..."
});

// Delete
deleteImage.mutate("uuid");
```

---

### Church Info Hooks

#### useChurchInfo()

Fetch church information (single record).

```typescript
const { data, isLoading, error } = useChurchInfo();
```

**Returns**: `ChurchInfo | null`

#### useChurchInfoMutation()

Update church information.

```typescript
const mutation = useChurchInfoMutation();

mutation.mutate({
  id: "uuid",
  church_name: "iCare Church",
  address: "123 Main St",
  pastor_name: "Pastor John",
  pastor_email: "pastor@church.com",
  pastor_phone: "+1234567890"
});
```

---

### Pastors Hooks

#### usePastors()

Fetch all pastors ordered by sort_order.

```typescript
const { data, isLoading, error } = usePastors();
```

**Returns**: `Pastor[]`

#### usePastorMutations()

CRUD operations for pastors.

```typescript
const { createPastor, updatePastor, deletePastor, updateSortOrder } = usePastorMutations();

// Create
createPastor.mutate({
  name: "Pastor John Doe",
  email: "pastor@church.com",
  phone: "+1234567890",
  title: "Senior Pastor",
  bio: "Pastor John has been serving...",
  image_url: "https://...",
  sort_order: 1
});

// Update
updatePastor.mutate({
  id: "uuid",
  title: "Lead Pastor"
});

// Delete
deletePastor.mutate("uuid");

// Update sort order (bulk)
updateSortOrder.mutate([
  { id: "uuid1", sort_order: 1 },
  { id: "uuid2", sort_order: 2 }
]);
```

---

### Analytics Hooks

Located in `icarecenter-frontend/src/domains/analytics/hooks/useAnalytics.ts`.

#### useAnalytics()

Track page views and fetch analytics data.

```typescript
const { trackPageView, getAnalytics } = useAnalytics();

// Track page view
trackPageView({
  page_path: "/about",
  page_title: "About Us",
  referrer: document.referrer
});

// Fetch analytics
const { data } = getAnalytics({
  startDate: "2024-01-01",
  endDate: "2024-12-31"
});
```

---

### Authentication Hook

Located in `icarecenter-frontend/src/domains/auth/hooks/useAuth.ts`.

#### useAuth()

Access authentication state and methods.

```typescript
const { user, loading, signIn, signOut } = useAuth();

// Sign in
await signIn("email@example.com", "password");

// Sign out
await signOut();

// Check if authenticated
if (user) {
  // User is logged in
}
```

---

### Real-time Subscription Hook

Located in `icarecenter-frontend/src/shared/hooks/useRealtimeSubscription.ts`.

#### useRealtimeSubscription()

Subscribe to real-time database changes for admin/moderator tables.

```typescript
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

// In Admin or Moderator page component
useRealtimeSubscription();
```

**Subscribed Tables**:
- events
- ministries
- sermons
- gallery_images
- service_times
- church_info

**Behavior**: When changes occur on any subscribed table, the hook dispatches window events (`invalidate-{queryKey}`) that trigger automatic query refetches, keeping all connected admin panels in sync.

---

## Row Level Security (RLS)

All tables have Row Level Security enabled with the following policies:

### Public Read Access

All content tables allow public read access:

```sql
CREATE POLICY "Enable read access for all users"
ON public.[table_name]
FOR SELECT
TO public
USING (true);
```

**Applies to**:
- ministries
- events
- service_times
- sermons
- gallery_images
- church_info
- giving_settings (active only)

### Authenticated Write Access

Only authenticated users (admins) can modify data:

```sql
CREATE POLICY "Enable insert for authenticated users only"
ON public.[table_name]
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON public.[table_name]
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
ON public.[table_name]
FOR DELETE
TO authenticated
USING (true);
```

**Applies to**: All tables

### Analytics Special Case

The `website_analytics` table allows public insert for tracking:

```sql
CREATE POLICY "Allow public to insert analytics"
ON public.website_analytics
FOR INSERT
TO public
WITH CHECK (true);
```

But only authenticated users can read:

```sql
CREATE POLICY "Allow authenticated to read analytics"
ON public.website_analytics
FOR SELECT
TO authenticated
USING (true);
```

---

## Storage Buckets

### Gallery Bucket

**Bucket**: `gallery`  
**Public**: Yes  
**Max Files**: 15 (enforced at application level)

**Policies**:

```sql
-- Public read access
CREATE POLICY "Give public access to gallery images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery');

-- Authenticated upload
CREATE POLICY "Enable authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery');

-- Authenticated delete
CREATE POLICY "Enable authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery');
```

**File Upload Example**:

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('gallery')
  .upload(`images/${fileName}`, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('gallery')
  .getPublicUrl(data.path);

// Delete file
await supabase.storage
  .from('gallery')
  .remove([filePath]);
```

---

## Data Types

### TypeScript Interfaces

Data types are defined in `icarecenter-frontend/src/domains/` and `icarecenter-frontend/src/infrastructure/supabase/types.ts`:

```typescript
export interface Ministry {
  id: string;
  name: string;
  description: string | null;
  leader: string | null;
  meeting_time: string | null;
  image_url: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  image_url: string | null;
  status: 'scheduled' | 'postponed' | 'done';
  created_at: string;
  updated_at: string;
}

export interface Sermon {
  id: string;
  title: string;
  description: string | null;
  speaker: string;
  sermon_date: string;
  video_url: string | null;
  audio_url: string | null;
  scripture_reference: string | null;
  series_name: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// ... and more
```

### Insert Types

Insert types omit auto-generated fields:

```typescript
export type MinistryInsert = Omit<Ministry, 'id' | 'created_at' | 'updated_at'> & { id?: string };
export type EventInsert = Omit<Event, 'id' | 'created_at' | 'updated_at'> & { id?: string };
// ... etc
```

---

## Query Patterns

### Basic Query

```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .order('created_at', { ascending: false });
```

### Insert

```typescript
const { data, error } = await supabase
  .from('table_name')
  .insert([{ field: 'value' }])
  .select()
  .single();
```

### Update

```typescript
const { data, error } = await supabase
  .from('table_name')
  .update({ field: 'new_value' })
  .eq('id', 'uuid')
  .select()
  .single();
```

### Delete

```typescript
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', 'uuid');
```

### Filtering

```typescript
// Single filter
.eq('status', 'scheduled')

// Multiple filters
.gte('event_date', '2024-01-01')
.lte('event_date', '2024-12-31')

// Text search
.ilike('title', '%search%')

// Limit
.limit(10)

// Order
.order('created_at', { ascending: false })
```

---

## Error Handling

### Query Errors

```typescript
const { data, error } = await supabase.from('table').select('*');

if (error) {
  console.error('Query error:', error.message);
  throw error;
}

return data;
```

### Mutation Errors

```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const { error } = await supabase.from('table').insert(data);
    if (error) throw error;
  },
  onError: (error) => {
    toast.error(`Failed: ${error.message}`);
  },
  onSuccess: () => {
    toast.success('Saved successfully');
  }
});
```

---

## Best Practices

### Data Fetching

1. **Use TanStack Query**: Leverage caching and automatic refetching
2. **Handle Loading States**: Show loading indicators
3. **Handle Errors**: Display user-friendly error messages
4. **Invalidate Queries**: Refresh data after mutations

### Mutations

1. **Optimistic Updates**: Update UI before server confirmation
2. **Error Recovery**: Rollback on failure
3. **Toast Notifications**: Inform users of success/failure
4. **Query Invalidation**: Refresh related queries

### Security

1. **Never Expose Service Key**: Only use anon/public key in frontend
2. **Rely on RLS**: Let database handle authorization
3. **Validate Input**: Use Zod schemas for validation
4. **Sanitize Data**: Prevent XSS and SQL injection

### Performance

1. **Select Only Needed Fields**: Avoid `SELECT *` when possible
2. **Use Indexes**: Ensure frequently queried columns are indexed
3. **Limit Results**: Use pagination for large datasets
4. **Cache Aggressively**: Configure appropriate stale times

---

For more information, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [COMPONENTS.md](./COMPONENTS.md) - Component documentation
- [SECURITY.md](./SECURITY.md) - Security best practices
