# Security Documentation

This document outlines security considerations, best practices, and implemented security measures for the iCare Church Website.

## Table of Contents

- [Security Overview](#security-overview)
- [Authentication \& Authorization](#authentication--authorization)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Input Validation](#input-validation)
- [Environment Variables](#environment-variables)
- [Content Security](#content-security)
- [File Upload Security](#file-upload-security)
- [Recent Security Fixes](#recent-security-fixes)
- [Best Practices](#best-practices)
- [Reporting Vulnerabilities](#reporting-vulnerabilities)

## Security Overview

The iCare Church Website implements multiple layers of security:

1. **Database-level**: Row Level Security (RLS) policies
2. **Application-level**: Input validation and sanitization
3. **Authentication**: Supabase Auth with secure session management
4. **Authorization**: Role-based access control
5. **Transport**: HTTPS encryption (via Netlify)

### Security Principles

- **Defense in Depth**: Multiple security layers
- **Least Privilege**: Minimal permissions by default
- **Secure by Default**: Security built into architecture
- **Input Validation**: All user input validated
- **Fail Securely**: Errors don't expose sensitive information

## Authentication & Authorization

### Authentication Flow

The application uses **Supabase Auth** for authentication:

```typescript
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'secure-password'
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### Session Management

- **Storage**: Sessions stored in `localStorage`
- **Auto-refresh**: Tokens automatically refreshed
- **Persistence**: Sessions persist across browser restarts
- **Expiration**: Tokens expire after configured period

### Protected Routes

Admin routes are protected by authentication checks:

```typescript
function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" />;

  return <AdminDashboard />;
}
```

### Authorization Levels

1. **Anonymous (Public)**
   - Read access to public content
   - No write access
   - No admin access

2. **Authenticated (Admin)**
   - Full read access
   - Write access to all tables (via RLS)
   - Access to admin dashboard
   - File upload permissions

## Row Level Security (RLS)

All database tables have RLS enabled to enforce authorization at the database level.

### Public Read Policies

All content is publicly readable:

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
- giving_settings
- pastors

### Admin Write Policies

Only authenticated admin users can modify data:

```sql
CREATE POLICY "Admins can insert [table]"
ON public.[table_name]
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update [table]"
ON public.[table_name]
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete [table]"
ON public.[table_name]
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

### Analytics Special Case

The `website_analytics` table allows public insert for tracking:

```sql
-- Public can insert analytics
CREATE POLICY "Allow public to insert analytics"
ON public.website_analytics
FOR INSERT
TO public
WITH CHECK (true);

-- Only admins can read analytics
CREATE POLICY "Allow authenticated to read analytics"
ON public.website_analytics
FOR SELECT
TO authenticated
USING (true);
```

### Pastors Table Policies

The `pastors` table allows both admins and moderators to manage pastor records:

```sql
-- Public read access
CREATE POLICY "Anyone can view pastors"
ON public.pastors FOR SELECT
TO anon, authenticated
USING (true);

-- Admin can manage
CREATE POLICY "Admins can manage pastors"
ON public.pastors FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Moderators can manage
CREATE POLICY "Moderators can manage pastors"
ON public.pastors FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'moderator'));
```

### Storage Security

Gallery storage bucket has RLS policies:

```sql
-- Public read access
CREATE POLICY "Give public access to gallery images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery');

-- Admin-only upload/delete
CREATE POLICY "Admins can upload gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery' AND 
  public.has_role(auth.uid(), 'admin')
);
```

## Input Validation

All user input is validated using **Zod** schemas before submission.

### Form Validation Example

```typescript
import { z } from "zod";

const eventSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title too long"),
  description: z.string()
    .max(1000, "Description too long")
    .optional(),
  event_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  location: z.string()
    .max(200, "Location too long")
    .optional(),
  status: z.enum(['scheduled', 'postponed', 'done']),
});

type EventFormData = z.infer<typeof eventSchema>;
```

### Validation Rules

1. **Required Fields**: Marked as non-optional
2. **String Length**: Min/max length constraints
3. **Format Validation**: Regex patterns for emails, dates, URLs
4. **Type Safety**: TypeScript + Zod for compile-time and runtime checks
5. **Sanitization**: HTML/script tags stripped from text inputs

### File Upload Validation

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validateFile(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 5MB');
  }
  
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed');
  }
  
  return true;
}
```

## Environment Variables

### Required Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Security Guidelines

1. **Never Commit Secrets**: `.env.local` is gitignored
2. **Use Anon Key**: Never use service role key in frontend
3. **Environment-Specific**: Different keys for dev/staging/production
4. **Netlify Variables**: Set in Netlify dashboard, not in code
5. **VITE_ Prefix**: Required for Vite to expose variables to frontend

### What NOT to Do

❌ **Don't commit `.env.local`**
```bash
# Bad - exposes secrets
git add .env.local
```

❌ **Don't use service role key in frontend**
```typescript
// Bad - too much access
const SUPABASE_SERVICE_KEY = "eyJ..."; // Never do this!
```

❌ **Don't hardcode secrets**
```typescript
// Bad - secrets in code
const API_KEY = "sk_live_abc123";
```

### What TO Do

✅ **Use environment variables**
```typescript
// Good
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
```

✅ **Keep `.env.local` gitignored**
```bash
# .gitignore
.env.local
.env*.local
```

✅ **Use anon key with RLS**
```typescript
// Good - RLS protects data
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

## Content Security

### XSS Prevention

React automatically escapes output, preventing XSS attacks:

```tsx
// Safe - React escapes user input
<div>{userInput}</div>

// Dangerous - avoid dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### CSRF Protection

Supabase handles CSRF protection automatically:
- JWT tokens in Authorization header
- No cookies for authentication
- SameSite cookie attributes

### SQL Injection Prevention

Supabase client uses parameterized queries:

```typescript
// Safe - parameterized
await supabase
  .from('events')
  .select('*')
  .eq('title', userInput);

// Never build raw SQL from user input
```

## File Upload Security

### Gallery Image Upload

Maximum 15 images enforced at application level:

```typescript
const { data: existingImages } = await supabase
  .from('gallery_images')
  .select('id');

if (existingImages && existingImages.length >= 15) {
  throw new Error('Maximum 15 images allowed');
}
```

### File Type Restrictions

```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Invalid file type');
}
```

### File Size Limits

```typescript
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

if (file.size > MAX_SIZE) {
  throw new Error('File too large');
}
```

### Secure File Names

```typescript
// Generate unique, safe file names
const fileName = `${Date.now()}_${crypto.randomUUID()}.${ext}`;
```

## Recent Security Fixes

### Gallery Security Fix (2024-12-07)

**Migration**: `20251207120000_fix_gallery_security.sql`

**Issues Fixed**:
1. **Vulnerability 1.1**: Gallery RLS policies allowed any authenticated user to modify images
2. **Vulnerability 1.2**: Storage policies allowed any authenticated user to upload/delete files

**Changes Made**:

```sql
-- Before: Any authenticated user could modify
CREATE POLICY "Enable insert for authenticated users only"
ON public.gallery_images
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Too permissive!

-- After: Only admins can modify
CREATE POLICY "Admins can insert gallery images"
ON public.gallery_images
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));  -- Admin only
```

**Impact**: Now only users with admin role can manage gallery images.

## Best Practices

### For Developers

1. **Always Use RLS**
   - Enable RLS on all tables
   - Test policies thoroughly
   - Never bypass RLS in application code

2. **Validate All Input**
   - Use Zod schemas for validation
   - Validate on both client and server
   - Sanitize user-generated content

3. **Secure File Uploads**
   - Validate file types and sizes
   - Generate unique file names
   - Scan for malware (future enhancement)

4. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm update
   ```

5. **Use TypeScript Strictly**
   - Avoid `any` type
   - Enable strict mode
   - Type all function parameters

6. **Handle Errors Securely**
   - Don't expose stack traces to users
   - Log errors server-side
   - Show generic error messages

### For Administrators

1. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols
   - Use password manager

2. **Enable 2FA** (when available)
   - Add extra security layer
   - Use authenticator app

3. **Regular Security Audits**
   - Review user access
   - Check for suspicious activity
   - Update admin credentials periodically

4. **Monitor Analytics**
   - Watch for unusual traffic patterns
   - Check for failed login attempts
   - Review admin actions

### For Deployment

1. **Use HTTPS Only**
   - Netlify provides automatic SSL
   - Enforce HTTPS redirects

2. **Set Security Headers**
   ```toml
   # icarecenter-frontend/netlify.toml
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-Content-Type-Options = "nosniff"
       X-XSS-Protection = "1; mode=block"
       Referrer-Policy = "strict-origin-when-cross-origin"
   ```

3. **Environment Variables**
   - Set in Netlify dashboard
   - Never commit to repository
   - Use different keys per environment

4. **Regular Backups**
   - Backup Supabase database regularly
   - Test restore procedures
   - Store backups securely

## Security Checklist

### Before Deployment

- [ ] All tables have RLS enabled
- [ ] RLS policies tested and verified
- [ ] Environment variables set correctly
- [ ] No secrets committed to repository
- [ ] All forms have validation
- [ ] File uploads restricted and validated
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Dependencies updated
- [ ] No console.log with sensitive data

### Regular Maintenance

- [ ] Review and update dependencies monthly
- [ ] Audit user access quarterly
- [ ] Review RLS policies quarterly
- [ ] Check for security advisories
- [ ] Update admin passwords regularly
- [ ] Review analytics for anomalies
- [ ] Test backup restoration

## Reporting Vulnerabilities

If you discover a security vulnerability, please follow responsible disclosure:

### DO

1. **Email privately** to security contact (set up dedicated email)
2. **Provide details**:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. **Allow time** for fix before public disclosure
4. **Follow up** if no response within 48 hours

### DON'T

1. **Don't publicly disclose** before fix is deployed
2. **Don't exploit** the vulnerability
3. **Don't access** data you're not authorized to view
4. **Don't perform** destructive testing

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Fix Deployment**: Based on severity
  - Critical: Within 24 hours
  - High: Within 1 week
  - Medium: Within 1 month
  - Low: Next release cycle

## Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://react.dev/learn/security)
- [Netlify Security](https://docs.netlify.com/security/)

---

**Security is everyone's responsibility. When in doubt, ask for a security review.**

For more information, see:
- [README.md](./README.md) - Project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [API.md](./API.md) - API documentation
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
