# Development Guide

## Supabase Edge Function modules

When changing Edge Function behavior, work inside the owning module under functions/modules/ and keep the module-owned `entrypoint.ts` thin. Public function names are mapped to those entrypoints in `supabase/config.toml`. Keep domain/application code independent of Supabase, put Supabase calls in infrastructure repositories, and expose operations through presentation controllers and the module composition root. Do not restore removed legacy query/handler files. Empty layers are omitted and `.gitkeep` placeholders are not created.

This guide provides instructions for developers working on the iCare Church Website project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Common Tasks](#common-tasks)
- [Testing](#testing)
- [Building](#building)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Git** for version control
- **Code Editor** (VS Code recommended)
- **Supabase Account** for backend services

### Initial Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd icarewebsitenew
   ```

2. **Install frontend dependencies**

   ```bash
   cd icarecenter-frontend
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**

   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run migrations from `supabase/migrations/` in order
   - Get your project URL and anon key from Settings → API

5. **Start development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### VS Code Extensions (Recommended)

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind class autocomplete
- **TypeScript Vue Plugin (Volar)** - TypeScript support
- **Error Lens** - Inline error display

## Development Workflow

### Branch Strategy

- `main` - Production branch (auto-deploys to Netlify)
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Typical Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make changes and commit**

   ```bash
   git add .
   git commit -m "Add new feature"
   ```

3. **Push to remote**

   ```bash
   git push origin feature/my-new-feature
   ```

4. **Create Pull Request** on GitHub

5. **After review and approval**, merge to `develop` or `main`

### Running the Development Server

Run frontend commands from `icarecenter-frontend/`:

```bash
npm run dev
```

Features:
- Hot Module Replacement (HMR)
- Fast refresh for React components
- TypeScript type checking
- Automatic browser reload

### Type Checking

Run TypeScript type checking without building:

```bash
npm run typecheck
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
npm run lint -- --fix
```

## Code Style

### TypeScript Conventions

1. **Use TypeScript for all files**
   - `.tsx` for React components
   - `.ts` for utilities and hooks

2. **Define interfaces for props**

   ```typescript
   interface MyComponentProps {
     title: string;
     count?: number;
     onAction: () => void;
   }

   export function MyComponent({ title, count = 0, onAction }: MyComponentProps) {
     // ...
   }
   ```

3. **Use type inference when possible**

   ```typescript
   // Good
   const items = data.map(item => item.name);

   // Avoid over-annotation
   const items: string[] = data.map((item: DataItem): string => item.name);
   ```

### React Conventions

1. **Functional components with hooks**

   ```typescript
   export function MyComponent() {
     const [state, setState] = useState<string>('');
     
     useEffect(() => {
       // Side effects
     }, []);

     return <div>{state}</div>;
   }
   ```

2. **Custom hooks for logic**

   ```typescript
   function useMyFeature() {
     const [data, setData] = useState(null);
     
     useEffect(() => {
       // Fetch data
     }, []);

     return { data };
   }
   ```

3. **Props destructuring**

   ```typescript
   // Good
   function Component({ title, description }: Props) {
     return <div>{title}</div>;
   }

   // Avoid
   function Component(props: Props) {
     return <div>{props.title}</div>;
   }
   ```

### Naming Conventions

- **Components**: PascalCase (`MyComponent.tsx`)
- **Hooks**: camelCase with `use` prefix (`useMyHook.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITEMS`)
- **Types/Interfaces**: PascalCase (`UserData`, `ApiResponse`)

### File Organization

```
icarecenter-frontend/src/
├── components/
│   ├── admin/                 # Admin panel components
│   ├── moderator/             # Moderator panel components
│   ├── layout/                # Navbar, Footer
│   └── MyComponent.tsx        # Utility components
├── constant/                  # Static data
│   ├── bible-verses.ts        # Loading screen verses
│   ├── care.ts                # C.A.R.E. values
│   ├── core-values.ts         # Church values
│   └── expect-items.ts        # Service expectations
├── hooks/
│   ├── useChurchData.tsx      # Data hooks
│   ├── useAuth.tsx            # Auth hook
│   └── useRealtimeSubscription.ts # Real-time sync
├── lib/
│   └── utils.ts               # Utilities
└── pages/
    └── MyPage.tsx             # Page component
```

### Styling with Tailwind

1. **Use Tailwind utility classes**

   ```tsx
   <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
     <h2 className="text-xl font-bold">Title</h2>
   </div>
   ```

2. **Use `cn()` helper for conditional classes**

   ```tsx
   import { cn } from "@/lib/utils";

   <div className={cn(
     "base-classes",
     isActive && "active-classes",
     variant === "primary" && "primary-classes"
   )}>
   ```

3. **Extract repeated patterns to components**

   ```tsx
   // Instead of repeating classes
   <Card className="p-6 shadow-lg">...</Card>
   ```

## Common Tasks

### Adding a New Page

1. **Create page component**

   ```bash
   # Create file
   icarecenter-frontend/src/user/MyNewPage.tsx
   ```

   ```tsx
   import { Layout } from "@/components/layout/Layout";

   export default function MyNewPage() {
     return (
       <Layout>
         <div className="container mx-auto py-8">
           <h1>My New Page</h1>
         </div>
       </Layout>
     );
   }
   ```

2. **Add route**

   In `icarecenter-frontend/src/App.tsx`:

   ```tsx
   import MyNewPage from "./pages/MyNewPage";

   // In Routes
   <Route path="/my-page" element={<MyNewPage />} />
   ```

3. **Add navigation link**

   In `icarecenter-frontend/src/shared/components/layout/Navbar.tsx`:

   ```tsx
   <NavLink to="/my-page">My Page</NavLink>
   ```

### Adding a New Database Table

1. **Create migration file**

   ```bash
   # Create file in supabase/migrations/
   supabase/migrations/YYYYMMDDHHMMSS_add_my_table.sql
   ```

   ```sql
   -- Create table
   CREATE TABLE public.my_table (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );

   -- Enable RLS
   ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

   -- Add policies
   CREATE POLICY "Enable read access for all users"
   ON public.my_table FOR SELECT
   TO public
   USING (true);

   CREATE POLICY "Enable write for authenticated users"
   ON public.my_table FOR ALL
   TO authenticated
   USING (true);
   ```

2. **Run migration** in Supabase dashboard or CLI

3. **Create TypeScript types**

   In `icarecenter-frontend/src/shared/hooks/useChurchData.tsx`:

   ```typescript
   export interface MyData {
     id: string;
     name: string;
     created_at: string;
   }

   export type MyDataInsert = Omit<MyData, 'id' | 'created_at'>;
   ```

4. **Create hooks**

   ```typescript
   export function useMyData() {
     return useQuery({
       queryKey: ['my_data'],
       queryFn: async () => {
         const { data, error } = await supabase
           .from('my_table')
           .select('*');
         if (error) throw error;
         return data as MyData[];
       },
     });
   }
   ```

### Adding a New Component

1. **Create component file**

   ```bash
   icarecenter-frontend/src/shared/components/MyComponent.tsx
   ```

   ```tsx
   interface MyComponentProps {
     title: string;
     onAction?: () => void;
   }

   export function MyComponent({ title, onAction }: MyComponentProps) {
     return (
       <div className="p-4">
         <h2>{title}</h2>
         {onAction && (
           <button onClick={onAction}>Action</button>
         )}
       </div>
     );
   }
   ```

2. **Use the component**

   ```tsx
   import { MyComponent } from "@/components/MyComponent";

   <MyComponent title="Hello" onAction={() => console.log('clicked')} />
   ```

### Working with Forms

1. **Define validation schema**

   ```typescript
   import { z } from "zod";

   const schema = z.object({
     title: z.string().min(1, "Title is required"),
     description: z.string().optional(),
     email: z.string().email("Invalid email"),
   });

   type FormData = z.infer<typeof schema>;
   ```

2. **Create form with React Hook Form**

   ```tsx
   import { useForm } from "react-hook-form";
   import { zodResolver } from "@hookform/resolvers/zod";

   function MyForm() {
     const form = useForm<FormData>({
       resolver: zodResolver(schema),
       defaultValues: {
         title: "",
         description: "",
       },
     });

     const onSubmit = async (data: FormData) => {
       // Handle submission
       console.log(data);
     };

     return (
       <form onSubmit={form.handleSubmit(onSubmit)}>
         <input {...form.register("title")} />
         {form.formState.errors.title && (
           <span>{form.formState.errors.title.message}</span>
         )}
         <button type="submit">Submit</button>
       </form>
     );
   }
   ```

### File Upload to Supabase Storage

```typescript
async function uploadFile(file: File) {
  const fileName = `${Date.now()}_${file.name}`;
  
  // Upload to storage
  const { data, error } = await supabase.storage
    .from('bucket-name')
    .upload(`folder/${fileName}`, file);

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('bucket-name')
    .getPublicUrl(data.path);

  return publicUrl;
}
```

## Supabase Edge Functions

The content implementation is under
`supabase/functions/modules/content/`, while
`supabase/functions/modules/content/entrypoint.ts` is the configured
`content-data` entrypoint. Focused Deno tests live with each resource module and architecture
tests verify private modules, layer boundaries, request composition, and
documentation alignment. Unused layers are omitted; do not add `.gitkeep`
files to empty directories.

For `youtube-livestream`, keep scheduling and ports in `domain/`, the
`GetActiveLivestream` use case in `application/`, Supabase and YouTube adapters
in `infrastructure/`, and HTTP operation handling in `presentation/`. The
module `index.ts` composes those layers; `entrypoint.ts` remains transport-only.

Run the complete local Edge Function lane from `icarecenter-frontend/`:

```bash
npm run test:edge
```

## Testing

Currently, the project uses manual testing. Automated tests are planned for future implementation.

### Manual Testing Checklist

- [ ] Test on different screen sizes (mobile, tablet, desktop)
- [ ] Test all forms with valid and invalid data
- [ ] Test authentication flow (login/logout)
- [ ] Test CRUD operations in admin panel
- [ ] Test navigation and routing
- [ ] Test error handling
- [ ] Check browser console for errors
- [ ] Test with different browsers (Chrome, Firefox, Safari)

### Future: Automated Testing

Planned testing stack:
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing

## Building

### Development Build

```bash
npm run build:dev
```

Builds the app in development mode with source maps.

### Production Build

```bash
npm run build
```

Creates an optimized production build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

### Build Output

```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
├── index.html
└── _redirects
```

## Troubleshooting

### Common Issues

#### Port Already in Use

**Error**: `Port 5173 is already in use`

**Solution**:
```bash
# Kill process on port 5173
npx kill-port 5173

# Or use a different port
npm run dev -- --port 3000
```

#### TypeScript Errors

**Error**: Type errors in IDE

**Solution**:
```bash
# Restart TypeScript server in VS Code
# Command Palette (Ctrl+Shift+P) → "TypeScript: Restart TS Server"

# Or rebuild types
npm run typecheck
```

#### Supabase Connection Issues

**Error**: `Failed to fetch` or `Invalid API key`

**Solution**:
1. Check `.env.local` has correct values
2. Verify Supabase project is active
3. Check RLS policies are configured
4. Ensure anon key is used (not service key)

#### Build Failures

**Error**: Build fails with module errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

#### Styles Not Applying

**Error**: Tailwind classes not working

**Solution**:
1. Check `tailwind.config.ts` includes correct content paths
2. Restart dev server
3. Clear browser cache
4. Check for typos in class names

#### Image Upload Fails

**Error**: File upload to Supabase Storage fails

**Solution**:
1. Check storage bucket exists
2. Verify storage policies are configured
3. Check file size limits
4. Ensure correct bucket name in code

### Getting Help

- **Documentation**: Check this guide and other docs
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **React Docs**: [react.dev](https://react.dev)
- **Vite Docs**: [vitejs.dev](https://vitejs.dev)
- **GitHub Issues**: Report bugs and request features

## Best Practices

### Performance

1. **Lazy load routes** for code splitting
2. **Optimize images** before uploading
3. **Use React.memo** for expensive components
4. **Debounce search inputs**
5. **Limit database queries** with proper caching

### Security

1. **Never commit `.env.local`** to git
2. **Use environment variables** for secrets
3. **Validate all user input** with Zod
4. **Rely on RLS** for authorization
5. **Keep dependencies updated**

### Code Quality

1. **Write meaningful commit messages**
2. **Keep components small and focused**
3. **Extract reusable logic to hooks**
4. **Document complex logic with comments**
5. **Use TypeScript strictly** (avoid `any`)

### Accessibility

1. **Use semantic HTML** elements
2. **Add ARIA labels** where needed
3. **Ensure keyboard navigation** works
4. **Test with screen readers**
5. **Maintain color contrast** ratios

---

For more information, see:
- [README.md](./README.md) - Project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [COMPONENTS.md](./COMPONENTS.md) - Component documentation
- [API.md](./API.md) - API documentation
- [SECURITY.md](./SECURITY.md) - Security guidelines
