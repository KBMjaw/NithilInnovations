# Nithil Innovations – Website

Static site (plain HTML, CSS, JS – no build step). Open `index.html` or deploy the folder as-is to **Vercel**, **Netlify** or **GitHub Pages**.

## Structure
```
index.html            single-page site (SEO meta, Open Graph, JSON-LD)
404.html  robots.txt  sitemap.xml  site.webmanifest
assets/css/style.css  all styles (brand colours are CSS variables in :root)
assets/js/config.js   EDIT THIS: email, phone, WhatsApp, socials, form key
assets/js/main.js     menu, scroll effects, portfolio filter, form logic
assets/img/           logo, favicons, og-image, SVG illustrations
```

## Things to update
1. **Email / phone / socials** → `assets/js/config.js` (blank social URL = icon hidden).
2. **Enquiry form** → create a free key at https://web3forms.com (enter the inbox that should receive enquiries) and paste it into `form.accessKey` in `config.js`. Until then the form opens the visitor's email app with the details pre-filled.
3. **Portfolio** → replace the sample cards in the `#portfolio` section (marked with an `EDIT HERE` comment) with real projects.
4. **Domain** → set `nithilinnovations.com` in your host's dashboard. For GitHub Pages add a `CNAME` file containing the domain.
5. **Colours** → `:root` variables at the top of `style.css` (`--gold` is the logo yellow `#FBBC06`, used sparingly).

## Tamil (future)
Keep all visible copy in `index.html`; to add Tamil later, duplicate it as `ta/index.html` with `lang="ta"` and add `hreflang` links.

## Interactive globe
`assets/vendor/globe.bundle.js` is a small pre-built bundle (d3-geo + Natural Earth data, no attribution logo), loaded lazily when the "Build Smarter. Move Faster." section scrolls into view. Source: `tools/globe/globe.src.js` (rebuild with `cd tools/globe && npm install && npm run build`).

## Google Maps
The official Nithil Innovations embed is already set in the `.mapbox` iframe in `index.html`.

## Blog + admin
- Public: `/blog/` (list) and `/blog/post.html?slug=…` (article). Latest 3 posts also appear on the home page once something is published.
- Admin: `/admin/` – sign in, write in Markdown (toolbar, preview, image upload), save draft / publish / unpublish / delete. Published posts go live immediately.
- Backend: Supabase (Postgres + Auth + Storage), called directly from the browser; no server code.

Setup (one time):
1. Create a Supabase project, then Authentication → Users → **Add user** (admin email + password).
2. Run `supabase/blog.sql` in the SQL Editor, then run the commented `insert into public.blog_admins …` line at the bottom with the admin email.
3. Authentication → Sign In / Providers → turn **off** "Allow new users to sign up".
4. Put the project URL and publishable (anon) key into `assets/js/config.js` → `supabase`.

Only users listed in `blog_admins` can write (enforced by Row Level Security), so the anon key in `config.js` is safe to publish.
