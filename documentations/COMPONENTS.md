# Component Documentation

## Supabase Edge Function Content Module

The frontend reaches content through the existing `content-data` function.
Its deployment adapter is
`icarecenter-supabase/functions/content-data/index.ts`; the implementation is
composed from private resource modules under
`icarecenter-supabase/functions/modules/content/`.

Each resource keeps its own ports, use cases, repositories, controllers, and
tests. The public import surface is only
`icarecenter-supabase/functions/modules/content/index.ts`; frontend code and
other Edge Functions must not import a private resource path. Unused layers are
omitted, so no empty layer directory or `.gitkeep` placeholder is required.

This document provides comprehensive documentation for all components in the iCare Church Website application.

## Table of Contents

- [Component Organization](#component-organization)
- [Page Components](#page-components)
- [Layout Components](#layout-components)
- [Admin Components](#admin-components)
- [Utility Components](#utility-components)
- [UI Components](#ui-components)
- [Component Patterns](#component-patterns)

## Component Organization

Components are organized into the following directories:

```
icarecenter-frontend/src/shared/components/
├── admin/          # Admin panel components
├── layout/         # Layout components (Navbar, Footer)
├── ui/             # shadcn/ui components (50+ components)
└── [utility]       # Utility components (root level)
```

## Page Components

Page components are located in `icarecenter-frontend/src/user/` and correspond to routes in the application.

### Index.tsx
**Route**: `/`  
**Purpose**: Home page of the website

**Features**:
- Hero section with church welcome message
- Featured ministries
- Upcoming events preview
- Call-to-action sections
- Responsive design

**Dependencies**: 
- `useMinistries()` - Fetch ministries data
- `useEvents()` - Fetch upcoming events

---

### About.tsx
**Route**: `/about`  
**Purpose**: Church information and history

**Features**:
- Church mission and vision
- Multiple pastors display with cards (auto-centered)
- Church history
- Core beliefs and values

**Dependencies**:
- `usePastors()` - Fetch pastor profiles

---

### Services.tsx
**Route**: `/services`  
**Purpose**: Display service times and schedule

**Features**:
- Service times listing
- Service descriptions
- "What to Expect" cards section
- "Planning to Visit" section with contact button

**Dependencies**:
- `useServiceTimes()` - Fetch service schedule
- `expectItems` from `icarecenter-frontend/src/shared/constants/expect-items.ts`

---

### Ministries.tsx
**Route**: `/ministries`  
**Purpose**: Overview of church ministries

**Features**:
- Ministry cards with images
- Ministry descriptions
- Contact information for each ministry
- Responsive grid layout

**Dependencies**:
- `useMinistries()` - Fetch ministries data

---

### Events.tsx
**Route**: `/events`  
**Purpose**: Display church events

**Features**:
- Event cards with status badges (upcoming/ongoing/completed)
- Event filtering by status
- Event details (date, time, location)
- Responsive layout

**Dependencies**:
- `useEvents()` - Fetch events data

---

### Sermons.tsx
**Route**: `/sermons`  
**Purpose**: Browse and watch sermon recordings

**Features**:
- Sermon grid with thumbnails
- Search functionality
- Filter by speaker or series
- Featured sermons section
- Video/audio playback
- Scripture references

**Dependencies**:
- `useSermons()` - Fetch sermons data

---

### Gallery.tsx
**Route**: `/gallery`  
**Purpose**: Photo gallery of church life

**Features**:
- Image grid layout
- Image lightbox/modal view
- Image titles and descriptions
- Responsive masonry layout
- Maximum 15 images

**Dependencies**:
- `useGallery()` - Fetch gallery images

---

### Contact.tsx
**Route**: `/contact`  
**Purpose**: Contact form and church location

**Features**:
- Contact form with validation
- Interactive map (Leaflet)
- Church address and contact info
- Form submission handling

**Dependencies**:
- `Map` component
- React Hook Form + Zod validation

---

### Giving.tsx
**Route**: `/giving`  
**Purpose**: Online giving information

**Features**:
- Giving options display
- Payment method information
- QR codes for mobile payments
- Secure payment links

**Dependencies**:
- `useGivingSettings()` - Fetch giving configuration

---

### Auth.tsx
**Route**: `/auth`  
**Purpose**: Admin login page

**Features**:
- Email/password login form
- Form validation
- Error handling
- Redirect after successful login

**Dependencies**:
- `useAuth()` - Authentication hook
- React Hook Form + Zod validation

---

### Admin.tsx
**Route**: `/admin` (Protected)  
**Purpose**: Admin dashboard

**Features**:
- Protected route (requires admin role)
- Tabbed interface for different admin sections
- Analytics overview
- Content management sections
- User management
- Real-time data synchronization

**Components Used**:
- `AdminSidebar`
- `AdminAnalytics`
- `AdminChurchInfo`
- `AdminEvents`
- `AdminGallery`
- `AdminGiving`
- `AdminMinistries`
- `AdminSermons`
- `AdminServiceTimes`
- `AdminUsers`
- `AdminProfile`

**Dependencies**:
- `useAuth()` - Check authentication status
- `useRealtimeSubscription()` - Real-time data sync

---

### Moderator.tsx
**Route**: `/moderator` (Protected)  
**Purpose**: Moderator dashboard with limited permissions

**Features**:
- Protected route (requires moderator role)
- Content management (events, ministries, sermons, service times)
- Gallery management
- Pastor management
- No access to user management or analytics

**Dependencies**:
- `useAuth()` - Check authentication status
- `useRealtimeSubscription()` - Real-time data sync

---

### NotFound.tsx
**Route**: `*` (404)  
**Purpose**: 404 error page

**Features**:
- Friendly error message
- Link back to home page
- Custom styling

---

## Layout Components

Located in `icarecenter-frontend/src/shared/components/layout/`

### Navbar.tsx
**Purpose**: Main navigation bar

**Features**:
- Responsive navigation menu
- Mobile hamburger menu with accordion
- Active link highlighting
- Smooth scrolling to page sections
- Logo and branding
- Visibility toggle for hero section
- Dropdown menus with sub-links

**Props**:
```typescript
interface NavbarProps {
  isVisible?: boolean; // Controls navbar visibility (default: true)
}
```

**State**:
- `mobileMenuOpen` - Controls mobile menu visibility

---

### Footer.tsx
**Purpose**: Site footer

**Features**:
- Church contact information
- Social media links
- Quick links to pages
- Copyright information
- Responsive layout

**Props**: None

---

### Layout.tsx
**Purpose**: Main layout wrapper

**Features**:
- Wraps all pages with Navbar and Footer
- Consistent page structure
- Outlet for page content

**Props**:
- `children` - Page content

---

## Admin Components

Located in `icarecenter-frontend/src/shared/components/admin/`

### AdminSidebar.tsx
**Purpose**: Admin navigation sidebar

**Features**:
- Navigation links to admin sections
- Active section highlighting
- Logout button
- Responsive design

**Props**:
- `activeSection` - Currently active section
- `onSectionChange` - Callback for section changes

---

### AdminAnalytics.tsx
**Purpose**: Website analytics dashboard

**Features**:
- Page view statistics
- Visitor analytics
- Time-based charts (daily, weekly, monthly)
- Top pages ranking
- Referrer tracking
- Device/browser analytics
- Interactive charts (Recharts)

**Dependencies**:
- `useAnalytics()` - Fetch analytics data
- Recharts library

**Key Functions**:
- `formatPagePath()` - Format page paths for display
- `formatChartData()` - Transform data for charts

---

### AdminChurchInfo.tsx
**Purpose**: Manage church information

**Features**:
- Edit church name, address, phone
- Update church description
- Save changes to database

**Dependencies**:
- `useChurchInfo()` - Fetch and update church info
- React Hook Form

---

### AdminEvents.tsx
**Purpose**: Manage church events

**Features**:
- Create new events
- Edit existing events
- Delete events
- Event status management (upcoming/ongoing/completed)
- Form validation

**Dependencies**:
- `useEvents()` - Fetch events
- `useEventMutations()` - Create/update/delete events
- React Hook Form + Zod validation

---

### AdminGallery.tsx
**Purpose**: Manage gallery images

**Features**:
- Upload new images (max 15)
- Delete images
- Image preview
- Title and description for each image
- File upload validation
- Storage management

**Dependencies**:
- `useGallery()` - Fetch gallery images
- `useGalleryMutations()` - Add/delete images
- `ImageUpload` component
- Supabase Storage

**Key Functions**:
- `handleFileChange()` - Handle file selection
- `handleUpload()` - Upload image to Supabase Storage
- `handleDelete()` - Delete image from storage and database

**Constraints**:
- Maximum 15 images
- Supported formats: JPEG, PNG, WebP
- Maximum file size: 5MB

---

### AdminGiving.tsx
**Purpose**: Configure giving/donation settings

**Features**:
- Add payment methods
- Update account information
- Upload QR codes for mobile payments
- Enable/disable payment methods
- Form validation

**Dependencies**:
- `useGivingSettings()` - Fetch giving settings
- `useGivingMutations()` - Update settings
- React Hook Form

---

### AdminMinistries.tsx
**Purpose**: Manage church ministries

**Features**:
- Create new ministries
- Edit ministry details
- Delete ministries
- Upload ministry images
- Form validation

**Dependencies**:
- `useMinistries()` - Fetch ministries
- `useMinistryMutations()` - Create/update/delete
- `ImageUpload` component

---

### AdminSermons.tsx
**Purpose**: Manage sermon recordings

**Features**:
- Upload new sermons
- Edit sermon details
- Delete sermons
- Video/audio URL management
- Thumbnail upload
- Scripture reference tracking
- Series management
- Featured sermon toggle
- Duration tracking

**Dependencies**:
- `useSermons()` - Fetch sermons
- `useSermonMutations()` - Create/update/delete
- React Hook Form + Zod validation

---

### AdminServiceTimes.tsx
**Purpose**: Manage service schedule

**Features**:
- Add service times
- Edit existing times
- Delete service times
- Service type categorization
- Day of week selection

**Dependencies**:
- `useServiceTimes()` - Fetch service times
- `useServiceTimeMutations()` - Create/update/delete
- React Hook Form

---

### ImageUpload.tsx
**Purpose**: Reusable image upload component

**Features**:
- Drag and drop support
- File preview
- Upload progress
- File validation
- Error handling

**Props**:
```typescript
interface ImageUploadProps {
  onUpload: (file: File) => void;
  accept?: string;
  maxSize?: number;
  preview?: string;
}
```

**Usage**:
```tsx
<ImageUpload
  onUpload={handleImageUpload}
  accept="image/*"
  maxSize={5 * 1024 * 1024} // 5MB
  preview={imageUrl}
/>
```

---

## Utility Components

Located in `icarecenter-frontend/src/shared/components/` (root level)

### AppLoadingScreen.tsx
**Purpose**: Initial app loading screen

**Features**:
- Bible verse rotation
- Loading progress bar
- Church branding
- Smooth transitions
- Internet connectivity check

**Props**: None

**State**:
- `currentVerse` - Currently displayed Bible verse
- `progress` - Loading progress percentage

**Dependencies**:
- `bibleVerses` from `icarecenter-frontend/src/shared/constants/bible-verses.ts`

---

### CareGrid.tsx
**Purpose**: Display C.A.R.E. values in a grid layout

**Features**:
- Animated cards for each C.A.R.E. value
- Icons and descriptions
- Hover effects
- Gradient styling

**Dependencies**:
- `careItems` from `icarecenter-frontend/src/shared/constants/care.ts`

---

### FacebookLiveEmbed.tsx
**Purpose**: Embed Facebook Live streams

**Features**:
- Facebook SDK integration
- Responsive video player
- Client-side only rendering (SSR safe)
- Lazy loading

**Props**:
```typescript
interface FacebookLiveEmbedProps {
  videoUrl: string;  // Facebook video URL
  width?: number;    // Player width
  height?: number;   // Player height
}
```

---

### ScrollToTop.tsx
**Purpose**: Scroll to top on route change

**Features**:
- Automatic scroll to top on navigation
- Wrapped in BrowserRouter

**Props**: None

---

### PageTracker.tsx
**Purpose**: Track page views for analytics

**Features**:
- Automatic page view tracking
- Route change detection
- Analytics data submission

**Dependencies**:
- `useAnalytics()` - Submit analytics data
- React Router's `useLocation`

**Props**: None

---

### Map.tsx
**Purpose**: Interactive map component

**Features**:
- Leaflet map integration
- Custom markers
- Zoom controls
- Responsive sizing

**Props**:
```typescript
interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markerText?: string;
}
```

**Usage**:
```tsx
<Map
  latitude={14.5995}
  longitude={120.9842}
  zoom={15}
  markerText="Our Church"
/>
```

---

### NavLink.tsx
**Purpose**: Navigation link with active state

**Features**:
- Active route highlighting
- Smooth scrolling
- Accessibility support

**Props**:
```typescript
interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}
```

---

### SectionNav.tsx
**Purpose**: Section navigation for long pages

**Features**:
- Smooth scroll to sections
- Active section highlighting
- Sticky positioning

**Props**:
```typescript
interface SectionNavProps {
  sections: Array<{
    id: string;
    label: string;
  }>;
}
```

---

## UI Components

Located in `icarecenter-frontend/src/shared/components/ui/`

The application uses **shadcn/ui** components built on **Radix UI** primitives. These are pre-built, accessible, and customizable components.

### Available UI Components

- **Accordion** - Collapsible content sections
- **Alert** - Alert messages and notifications
- **Alert Dialog** - Modal dialogs for confirmations
- **Avatar** - User avatars with fallbacks
- **Badge** - Status badges and labels
- **Button** - Buttons with variants
- **Card** - Content containers
- **Checkbox** - Checkboxes with labels
- **Collapsible** - Collapsible content
- **Command** - Command palette
- **Context Menu** - Right-click menus
- **Dialog** - Modal dialogs
- **Dropdown Menu** - Dropdown menus
- **Form** - Form components with validation
- **Hover Card** - Hover-triggered cards
- **Input** - Text inputs
- **Label** - Form labels
- **Menubar** - Menu bars
- **Navigation Menu** - Navigation menus
- **Popover** - Popover content
- **Progress** - Progress bars
- **Radio Group** - Radio button groups
- **Scroll Area** - Scrollable areas
- **Select** - Select dropdowns
- **Separator** - Visual separators
- **Sheet** - Side sheets/drawers
- **Slider** - Range sliders
- **Switch** - Toggle switches
- **Table** - Data tables
- **Tabs** - Tabbed interfaces
- **Textarea** - Multi-line text inputs
- **Toast** - Toast notifications
- **Toggle** - Toggle buttons
- **Tooltip** - Tooltips

### UI Component Usage

All UI components follow the shadcn/ui patterns:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="default">Click me</Button>
  </CardContent>
</Card>
```

### Customization

UI components can be customized via:
1. **Variants**: Pre-defined style variants
2. **ClassName**: Tailwind classes for custom styling
3. **Theme**: Global theme configuration in `tailwind.config.ts`

---

## Component Patterns

### Data Fetching Pattern

Components use custom hooks for data fetching:

```tsx
function MyComponent() {
  const { data, isLoading, error } = useMyData();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{/* Render data */}</div>;
}
```

### Form Pattern

Forms use React Hook Form with Zod validation:

```tsx
const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data) => {
    // Handle submission
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Mutation Pattern

Data mutations use TanStack Query mutations:

```tsx
const { mutate, isPending } = useMutation({
  mutationFn: async (data) => {
    const { error } = await supabase
      .from('table')
      .insert(data);
    if (error) throw error;
  },
  onSuccess: () => {
    toast.success("Saved successfully");
    queryClient.invalidateQueries(['table']);
  },
  onError: (error) => {
    toast.error("Failed to save");
  },
});
```

### Protected Component Pattern

Admin components check authentication:

```tsx
function AdminComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" />;
  
  return <div>{/* Admin content */}</div>;
}
```

---

## Best Practices

### Component Design

1. **Single Responsibility**: Each component has one clear purpose
2. **Composition**: Build complex UIs from simple components
3. **Props Over State**: Prefer props for component configuration
4. **Controlled Components**: Use controlled inputs for forms

### Performance

1. **Lazy Loading**: Use React.lazy for route-based code splitting
2. **Memoization**: Use React.memo for expensive components
3. **Avoid Inline Functions**: Define callbacks outside render
4. **Key Props**: Always provide keys for lists

### Accessibility

1. **Semantic HTML**: Use appropriate HTML elements
2. **ARIA Labels**: Add labels for screen readers
3. **Keyboard Navigation**: Ensure keyboard accessibility
4. **Focus Management**: Manage focus for modals and dialogs

### Styling

1. **Tailwind Classes**: Use Tailwind for styling
2. **Component Variants**: Use CVA for variant management
3. **Responsive Design**: Mobile-first approach
4. **Dark Mode**: Support dark mode where applicable

---

## Adding New Components

### Steps to Add a New Component

1. **Create Component File**:
   ```bash
   # For page component
   icarecenter-frontend/src/user/MyNewPage.tsx
   
   # For reusable component
   icarecenter-frontend/src/shared/components/MyComponent.tsx
   
   # For admin component
   icarecenter-frontend/src/shared/components/admin/AdminMyFeature.tsx
   ```

2. **Define Component**:
   ```tsx
   export function MyComponent({ prop1, prop2 }: MyComponentProps) {
     return <div>{/* Component content */}</div>;
   }
   ```

3. **Add Route** (if page component):
   ```tsx
   // In App.tsx
   <Route path="/my-page" element={<MyNewPage />} />
   ```

4. **Add Navigation Link**:
   ```tsx
   // In Navbar.tsx
   <NavLink to="/my-page">My Page</NavLink>
   ```

5. **Update Documentation**: Add component to this file

---

## Component Dependencies

### Common Dependencies

- **React**: Core library
- **React Router**: Routing
- **TanStack Query**: Data fetching
- **React Hook Form**: Form management
- **Zod**: Validation
- **Lucide React**: Icons
- **Tailwind CSS**: Styling

### Component-Specific Dependencies

- **Map.tsx**: Leaflet, @types/leaflet
- **AdminAnalytics.tsx**: Recharts, date-fns
- **ImageUpload.tsx**: Supabase Storage

---

## Troubleshooting

### Common Issues

**Component Not Rendering**:
- Check if component is exported correctly
- Verify import path
- Check for TypeScript errors

**Styles Not Applying**:
- Ensure Tailwind classes are correct
- Check if component has conflicting styles
- Verify Tailwind configuration

**Data Not Loading**:
- Check hook implementation
- Verify Supabase connection
- Check RLS policies

**Form Validation Failing**:
- Review Zod schema
- Check form field names
- Verify resolver configuration

---

For more information, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [API.md](./API.md) - Data layer documentation
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
