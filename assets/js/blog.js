/* Public blog pages: list (/blog/) and single article (/blog/post.html?slug=...) */
(function () {
  "use strict";
  var B = window.NithilBlog; if (!B) return;
  var list = document.getElementById("posts"), art = document.getElementById("article");

  function setMeta(title, desc, img, post) {
    document.title = title + " | Nithil Innovations";
    [["meta[name=description]", desc], ["meta[property='og:title']", title], ["meta[property='og:description']", desc],
      ["meta[name='twitter:title']", title], ["meta[name='twitter:description']", desc]].forEach(function (x) {
      var el = document.querySelector(x[0]); if (el && x[1]) el.setAttribute("content", x[1]);
    });
    if (img) {
      var image = new URL(img, location.href).href;
      ["meta[property='og:image']", "meta[name='twitter:image']"].forEach(function (selector) {
        var el = document.querySelector(selector); if (el) el.setAttribute("content", image);
      });
    }
    var canonical = document.querySelector("link[rel='canonical']");
    if (canonical) canonical.href = location.origin + location.pathname + "?slug=" + encodeURIComponent(post.slug);
    var ogUrl = document.querySelector("meta[property='og:url']");
    if (ogUrl) ogUrl.content = canonical ? canonical.href : location.href;
    var articleData = document.getElementById("article-jsonld");
    if (articleData) {
      articleData.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: desc,
        datePublished: post.published_at,
        image: img ? new URL(img, location.href).href : undefined,
        mainEntityOfPage: canonical ? canonical.href : location.href,
        author: { "@type": "Organization", name: "Nithil Innovations" },
        publisher: { "@type": "Organization", name: "Nithil Innovations", url: "https://www.nithilinnovations.com/" }
      });
    }
  }
  function msg(el, t) { el.innerHTML = '<p class="muted">' + B.esc(t) + "</p>"; }
  function icon(name) {
    var paths = {
      overview: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4h8v3M7 20v2m10-2v2M8 13h8m-4-4v8"/><circle cx="12" cy="13" r="2"/>',
      empty: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M7 16h10"/>',
      partial: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="m7 16 3-4 2 3 2-2 3 3"/>',
      full: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="m6 15 3-4 3 4 2-5 4 5"/>',
      warning: '<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3h.01"/>',
      camera: '<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="14" r="4"/><path d="m19 4 2 2"/>',
      settings: '<path d="m12 3 1.5 2.4 2.8-.1.8 2.7 2.5 1.3-.8 2.7.8 2.7-2.5 1.3-.8 2.7-2.8-.1L12 21l-1.5-2.4-2.8.1-.8-2.7-2.5-1.3.8-2.7-.8-2.7 2.5-1.3.8-2.7 2.8.1L12 3Z"/><circle cx="12" cy="12" r="3"/>',
      impact: '<path d="M4 20v-6h4v6m2 0V9h4v11m2 0V4h4v16"/>',
      people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2-5 6-5s6 2 6 5M17 5a3 3 0 0 1 0 6m1 4c2 .5 3 2 3 5"/>',
      chart: '<path d="M4 20v-6h4v6m2 0V9h4v11m2 0V4h4v16"/>',
      bolt: '<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
      badge: '<path d="M12 3 15 5l4-.2.5 4 2 3-2 3-.5 4-4-.2-3 2-3-2-4 .2-.5-4-2-3 2-3 .5-4L9 5z"/><path d="m9 12 2 2 4-4"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.overview) + "</svg>";
  }
  function pointList(points) {
    return Array.isArray(points) ? '<ul class="article-points">' + points.map(function (point) { return "<li>" + B.esc(point) + "</li>"; }).join("") + "</ul>" : "";
  }

  if (list) {
    if (!B.configured()) { msg(list, "Blog coming soon."); }
    else B.listPublished().then(function (posts) {
      if (!posts.length) return msg(list, "No articles yet – check back soon.");
      list.innerHTML = posts.map(function (p) { return B.card(p, ""); }).join("");
    }).catch(function () { msg(list, "Couldn't load articles right now. Please try again later."); });
  }

  if (art) {
    var slug = new URLSearchParams(location.search).get("slug");
    if (!slug || !B.configured()) { msg(art, "Article not found."); return; }
    B.getBySlug(slug).then(function (p) {
      if (!p) { msg(art, "Article not found."); return; }
      setMeta(p.title, p.excerpt || "", p.cover_image, p);
      var category = '<div class="article__eyebrows">' +
        (p.category ? '<p class="article__category">' + B.esc(p.category) + "</p>" : "") +
        (p.label ? '<span class="article__label">' + B.esc(p.label) + "</span>" : "") + "</div>";
      var heading = '<header class="article__header">' + category +
        '<h1 class="page-title">' + B.esc(p.title) + "</h1>" +
        (p.subtitle ? '<p class="article__subtitle">' + B.esc(p.subtitle) + "</p>" : "") + "</header>";
      var cover = p.cover_image ? '<figure class="article__figure"><img class="cover" src="' + B.esc(p.cover_image) + '" alt="' + B.esc(p.cover_alt || "") + '">' +
        (p.cover_caption ? '<figcaption class="visually-hidden">' + B.esc(p.cover_caption) + "</figcaption>" : "") + "</figure>" : "";
      var body;
      if (Array.isArray(p.sections)) {
        var overview = p.overview || p.intro;
        body = (overview ? '<section class="article-overview">' + icon("overview") +
          '<div><h2>Overview</h2><p>' + B.esc(overview) + "</p>" +
          (p.overview_note ? '<p class="article-overview__note">' + B.esc(p.overview_note) + "</p>" : "") + "</div></section>" : "") +
          p.sections.map(function (section, index) {
            var kind = ["challenge", "innovation", "solution", "impact"].indexOf(section.kind) !== -1 ? " article-section--" + section.kind : "";
            var title = section.headline || section.heading || "";
            var details = section.content ? '<div class="prose">' + B.md(section.content) + "</div>" : "";
            var states = Array.isArray(section.states) ? '<div class="feeder-states">' + section.states.map(function (state, stateIndex) {
              return '<span class="feeder-state feeder-state--' + stateIndex + '">' + icon(["empty", "partial", "full"][stateIndex] || "overview") + "<span>" + B.esc(state) + "</span></span>";
            }).join("") + "</div>" : "";
            var impactItems = Array.isArray(section.impact_items) ? '<div class="impact-grid">' + section.impact_items.map(function (item) {
              return '<div class="impact-card">' + icon(item.icon) + "<strong>" + B.esc(item.title) + "</strong><span>" + B.esc(item.description) + "</span></div>";
            }).join("") + "</div>" : "";
            var points = pointList(section.points);
            return '<section class="article-section' + kind + '">' +
              '<div class="article-section__icon">' + icon(section.icon) + "</div>" +
              '<div class="article-section__content"><p class="article-section__label"><span>' + String(index + 1).padStart(2, "0") + ".</span><span>" + B.esc(section.label || section.kind || "") + "</span></p>" +
              (title ? "<h2>" + B.esc(title) + "</h2>" : "") + details + points + states + impactItems + "</div></section>";
          }).join("") +
          (p.closing ? '<footer class="article__closing"><div><h2>Technology That Solves Real Industrial Problems</h2><p>' + B.esc(p.closing) + '</p></div><p class="article__closing-client">Developed for<strong>Kannan Infra Projects India Pvt. Ltd. (KIPIPL)</strong></p></footer>' : "");
      } else {
        body = '<div class="prose">' + B.md(p.content) + "</div>";
      }
      var breadcrumb = document.getElementById("article-breadcrumb-title");
      if (breadcrumb) breadcrumb.textContent = p.title;
      art.innerHTML = '<div class="article-editorial">' + heading + cover + '<div class="article__body">' + body + '</div><a class="link article__back" href="./">' + icon("overview") + "Back to Blog</a></div>";
    }).catch(function () { msg(art, "Couldn't load this article. Please try again later."); });
  }
})();
