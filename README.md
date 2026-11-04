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

## Blog
- Public: `/blog/` (list) and `/blog/post.html?slug=…` (article). The latest 3 posts also appear on the home page once something is published (the section stays hidden while there are none).
- Posts live in `blog/posts.json` (an array). To publish, add an entry and push:
  ```json
  { "slug": "my-first-post", "title": "My first post", "excerpt": "One-line summary.",
    "cover_image": "../assets/img/ai.svg", "published_at": "2026-11-04",
    "content": "## Heading\n\nMarkdown text with **bold**, [links](https://example.com) and lists." }
  ```
  Set `"status": "draft"` to hide a post. Content is Markdown (headings, bold/italic, links, lists, images, quotes, code).
- An admin page (browser-based writing/publishing) was prototyped with Supabase and can be added later – see git history (commit "Add blog with admin page").
