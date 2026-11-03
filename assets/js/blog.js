/* Public blog pages: list (/blog/) and single article (/blog/post.html?slug=...) */
(function () {
  "use strict";
  var B = window.NithilBlog; if (!B) return;
  var list = document.getElementById("posts"), art = document.getElementById("article");

  function setMeta(title, desc, img) {
    document.title = title + " | Nithil Innovations";
    [["meta[name=description]", desc], ["meta[property='og:title']", title], ["meta[property='og:description']", desc]].forEach(function (x) {
      var el = document.querySelector(x[0]); if (el && x[1]) el.setAttribute("content", x[1]);
    });
    if (img) { var o = document.querySelector("meta[property='og:image']"); if (o) o.setAttribute("content", img); }
  }
  function msg(el, t) { el.innerHTML = '<p class="muted">' + B.esc(t) + "</p>"; }

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
      if (!p) { setMeta("Article not found", "", ""); return msg(art, "Article not found."); }
      setMeta(p.title, p.excerpt || "", p.cover_image);
      art.innerHTML = "<small class=\"muted\">" + B.esc(B.fmtDate(p.published_at)) + "</small><h1 class=\"page-title\">" + B.esc(p.title) + "</h1>" +
        (p.cover_image ? '<img class="cover" src="' + B.esc(p.cover_image) + '" alt="">' : "") + '<div class="prose">' + B.md(p.content) + "</div>";
    }).catch(function () { msg(art, "Couldn't load this article. Please try again later."); });
  }
})();
