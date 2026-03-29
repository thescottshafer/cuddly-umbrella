# Crew Loading Master

Engineering resource and revenue management tool.

---

## Deploy in 4 steps

### Step 1 — Set up the Supabase database

1. Log in to https://app.supabase.com
2. Open your project, click **SQL Editor** in the left sidebar
3. Paste the entire contents of `supabase_setup.sql` and click **Run**
4. Go to **Settings > API** and copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public** key (long string starting with `eyJ...`)

---

### Step 2 — Push to GitHub

1. Create a new repository at https://github.com/new (can be private)
2. Upload all files in this folder to that repo, or use git:

```bash
cd crew-loading
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/crew-loading.git
git push -u origin main
```

---

### Step 3 — Deploy on Netlify

1. Log in to https://app.netlify.com
2. Click **Add new site > Import an existing project**
3. Choose **GitHub** and select your repository
4. Build settings (Netlify auto-detects these from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click **Add environment variables** and add:
   - `VITE_SUPABASE_URL` = your Project URL from Step 1
   - `VITE_SUPABASE_ANON_KEY` = your anon key from Step 1
6. Click **Deploy site**

Netlify builds and gives you a live URL in ~2 minutes.
You can set a custom domain in Site settings > Domain management.

---

### Step 4 — Share with your team

Send everyone the Netlify URL. All users share the same database — changes
one person makes (adding projects, updating tasks, logging hours) sync to
everyone else in real time.

---

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Create local env file
cp .env.example .env.local
# Fill in your Supabase URL and key in .env.local

# 3. Start dev server
npm run dev
# Opens at http://localhost:5173
```

---

## How data works

- All project and roster data is stored in a single Supabase table (`crew_loading_state`)
- Changes auto-save 1.5 seconds after the last edit (debounced)
- Real-time sync: if two people have the app open, changes appear for both
- The nav bar shows: **Saving...** while writing, **Saved** on success, **Save error** if something goes wrong
- If Supabase is not configured, the app still works fully but data resets on page refresh

---

## File structure

```
crew-loading/
  src/
    App.jsx          Main application (all components)
    main.jsx         React entry point
    supabase.js      Supabase client
    useSupabase.js   Data persistence hook
  index.html         HTML shell
  vite.config.js     Build config
  netlify.toml       Netlify deployment config
  supabase_setup.sql Run this in Supabase SQL editor
  .env.example       Copy to .env.local with your credentials
  package.json       Dependencies
```
