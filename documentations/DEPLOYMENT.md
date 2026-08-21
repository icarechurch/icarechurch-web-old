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

## Build Configuration

Production builds run in GitHub Actions with Node 22 using `npm run build:ssr`.
The verified artifact is deployed to Netlify with:

- **Publish directory**: `dist/client`
- **SSR server bundle**: `dist/server`
- **Netlify function**: `netlify/functions/ssr.js`

All routing and function configuration is in `netlify.toml`. See
[`CI-CD.md`](./CI-CD.md) for the required GitHub variables, production
secrets, and the automatic `master` release pipeline.

## Features Included

✅ **Single Page Application (SPA)** routing with React Router  
✅ **Security headers** for production  
✅ **Optimized caching** for static assets  
✅ **TypeScript compilation** during build  
✅ **Environment variables** for Supabase integration  

## Automatic Deployments

GitHub Actions automatically validates every pull request and `master` push.
After successful validation of `master`, it deploys the verified SSR artifact to
Netlify and deploys the Supabase migration/function changes. Netlify's separate
Git-triggered production deploy must remain disabled to avoid an ungated
duplicate deployment.

## Local Development

To run locally:

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd icarewebsitenew
   ```

2. **Install dependencies**
   ```bash
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
- Verify `netlify.toml` is in your repository root
- Check that the `_redirects` file is in the `public` folder

### Environment variables not working?
- Ensure variables start with `VITE_` prefix
- Check they are set in Netlify site settings, not just your local `.env` file

## Support

For deployment issues:
- Check [Netlify documentation](https://docs.netlify.com/)
- Review [Vite deployment guide](https://vitejs.dev/guide/static-deploy.html#netlify)

For Supabase integration:
- Check [Supabase documentation](https://supabase.com/docs)
