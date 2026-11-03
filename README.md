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
5. **Colours** → `:root` variables at the top of `style.css` (`--brand` is the logo yellow `#FBBC06`).

## Tamil (future)
Keep all visible copy in `index.html`; to add Tamil later, duplicate it as `ta/index.html` with `lang="ta"` and add `hreflang` links.

## Interactive globe
`assets/vendor/globe.bundle.js` is a pre-built (minified) amCharts 5 bundle, loaded lazily when the "Build Smarter. Move Faster." section scrolls into view. Source: `tools/globe/globe.src.js` (rebuild with `cd tools/globe && npm install && npm run build`). The free amCharts licence shows a small amCharts logo; a commercial licence removes it.

## Google Maps
In `index.html`, find the `<iframe>` inside `.mapbox` and replace its `src` with the `src` from your official Google Maps embed code.
