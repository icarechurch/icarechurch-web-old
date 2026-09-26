# Netlify Deployment Guide

This React + TypeScript + Vite application is configured for deployment on Netlify.

## Quick Start

1. **Connect your repository** to Netlify
2. **Set environment variables** (see below)
3. **Deploy** - Netlify will automatically build and deploy your site

## Environment Variables

You **must** set these environment variables in your Netlify site settings:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### How to set environment variables:
1. Go to your Netlify dashboard
2. Select your site
3. Go to "Site settings" → "Environment variables"
4. Add each variable with its corresponding value

### Getting your Supabase credentials:
1. Go to your [Supabase dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings → API
4. Copy:
   - **URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

## Contact and Auth Email Delivery

The public Contact page uses the Supabase `contact-message` Edge Function to
send messages through Gmail SMTP. Supabase Auth uses the same Gmail account for
signup confirmations, password resets, magic links, and invitations.

Configure Supabase Auth Custom SMTP with:

```text
SMTP host: smtp.gmail.com
SMTP port: 465
SMTP username and sender: icarecenter.media@gmail.com
SMTP password: the Gmail App Password
```

Set the contact function secrets in Supabase, not Netlify and not any `VITE_`
frontend environment variable:

```text
GMAIL_SMTP_USERNAME=icarecenter.media@gmail.com
GMAIL_SMTP_APP_PASSWORD=the Gmail App Password
CONTACT_RECIPIENT_EMAIL=icarecenter.media@gmail.com
```

Deploy the function and database migration with:

```bash
supabase functions deploy contact-message
supabase db push
```

After deployment, test one signup confirmation, one password reset, and one
Contact form submission. The App Password must never be committed to the
repository, browser bundle, Netlify frontend variables, or logs.

## Build Configuration

The existing Netlify deployment uses Node 22 and `npm run build:ssr` with:

- **Publish directory**: `dist/client`
- **SSR server bundle**: `dist/server`
- **Netlify function**: `icarecenter-frontend/netlify/functions/ssr.js`

The repository-level `netlify.toml` points Netlify at `icarecenter-frontend/` when the
site is connected to GitHub. All routing, function, and build configuration is in
`icarecenter-frontend/netlify.toml`.

## Features Included

✅ **Single Page Application (SPA)** routing with React Router  
✅ **Security headers** for production  
✅ **Optimized caching** for static assets  
✅ **TypeScript compilation** during build  
✅ **Environment variables** for Supabase integration  

## Automatic Deployments

GitHub Actions validates every pull request and `master` push. Netlify remains
responsible for the existing production deployment.

## Local Development

To run locally:

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
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
   # Edit .env.local with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Build Locally (Optional)

To test the production build locally:

```bash
npm run build
npm run preview
```

## Troubleshooting

### Build fails?
- Check that all environment variables are set correctly
- Ensure your Supabase project is active
- Check the Netlify build logs for specific errors

### 404 errors after deployment?
- Verify Netlify uses `icarecenter-frontend` as its base directory and reads `icarecenter-frontend/netlify.toml`
- Check that the `_redirects` file is in `icarecenter-frontend/public`

### Environment variables not working?
- Ensure variables start with `VITE_` prefix
- Check they are set in Netlify site settings, not just your local `.env` file

## Support

For deployment issues:
- Check [Netlify documentation](https://docs.netlify.com/)
- Review [Vite deployment guide](https://vitejs.dev/guide/static-deploy.html#netlify)

For Supabase integration:
- Check [Supabase documentation](https://supabase.com/docs)
