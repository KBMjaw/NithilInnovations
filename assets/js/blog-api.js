/* Blog helpers: Supabase REST (no SDK), safe Markdown renderer, card template. */
(function () {
  "use strict";
  var C = window.NITHIL_CONFIG || {};
  var S = C.supabase || {};

  function configured() { return !!(S.url && S.anonKey); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
  function fmtDate(d) {
    if (!d) return "";
    try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return ""; }
  }
  function slugify(t) { return String(t).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80); }

  function rest(path, opts, token) {
    opts = opts || {};
    var h = Object.assign({ apikey: S.anonKey, Authorization: "Bearer " + (token || S.anonKey) }, opts.headers || {});
    return fetch(S.url.replace(/\/$/, "") + "/rest/v1/" + path, Object.assign({}, opts, { headers: h })).then(function (r) {
      if (r.status === 204) return null;
      return r.json().then(function (j) { if (!r.ok) throw new Error((j && (j.message || j.hint)) || "Request failed"); return j; });
    });
  }

  function listPublished(limit) {
    return rest("posts?select=id,title,slug,excerpt,cover_image,published_at&status=eq.published&order=published_at.desc" + (limit ? "&limit=" + limit : ""));
  }
  function getBySlug(slug) {
    return rest("posts?select=*&status=eq.published&slug=eq." + encodeURIComponent(slug) + "&limit=1").then(function (r) { return r[0] || null; });
  }

  /* ----- Safe Markdown (input is HTML-escaped first; only a small whitelist is re-created) ----- */
  function safeUrl(u) { u = u.trim(); return /^(https?:\/\/|\/|\.\.?\/|mailto:|#)/i.test(u) ? u : "#"; }
  function inline(t) {
    t = esc(t);
    t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_, a, u) { return '<img src="' + esc(safeUrl(u.replace(/&amp;/g, "&"))) + '" alt="' + a + '" loading="lazy">'; });
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, a, u) {
      var url = safeUrl(u.replace(/&amp;/g, "&")), ext = /^https?:/i.test(url);
      return '<a href="' + esc(url) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + a + "</a>";
    });
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
    return t;
  }
  function md(src) {
    var lines = String(src || "").replace(/\r/g, "").split("\n"), out = [], i = 0, para = [];
    function flush() { if (para.length) { out.push("<p>" + inline(para.join(" ")) + "</p>"); para = []; } }
    while (i < lines.length) {
      var l = lines[i], m;
      if (/^```/.test(l)) {
        flush(); var code = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
        i++; out.push("<pre><code>" + esc(code.join("\n")) + "</code></pre>"); continue;
      }
      if ((m = l.match(/^(#{1,4})\s+(.*)$/))) { flush(); var n = Math.min(m[1].length + 1, 4); out.push("<h" + n + ">" + inline(m[2]) + "</h" + n + ">"); i++; continue; }
      if (/^---+\s*$/.test(l)) { flush(); out.push("<hr>"); i++; continue; }
      if (/^>\s?/.test(l)) { flush(); var q = []; while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, "")); out.push("<blockquote>" + inline(q.join(" ")) + "</blockquote>"); continue; }
      if (/^\s*([-*])\s+/.test(l)) { flush(); var u = []; while (i < lines.length && /^\s*([-*])\s+/.test(lines[i])) u.push("<li>" + inline(lines[i++].replace(/^\s*[-*]\s+/, "")) + "</li>"); out.push("<ul>" + u.join("") + "</ul>"); continue; }
      if (/^\s*\d+\.\s+/.test(l)) { flush(); var o = []; while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) o.push("<li>" + inline(lines[i++].replace(/^\s*\d+\.\s+/, "")) + "</li>"); out.push("<ol>" + o.join("") + "</ol>"); continue; }
      if (/^\s*$/.test(l)) { flush(); i++; continue; }
      para.push(l.trim()); i++;
    }
    flush(); return out.join("\n");
  }

  function card(p, base) {
    base = base || "";
    var href = base + "post.html?slug=" + encodeURIComponent(p.slug);
    return '<a class="post-card" href="' + esc(href) + '">' +
      (p.cover_image ? '<div class="post-card__img"><img src="' + esc(p.cover_image) + '" alt="" loading="lazy"></div>' : "") +
      "<small>" + esc(fmtDate(p.published_at)) + "</small><h3>" + esc(p.title) + "</h3>" +
      (p.excerpt ? "<p>" + esc(p.excerpt) + "</p>" : "") + "</a>";
  }

  window.NithilBlog = { configured: configured, esc: esc, fmtDate: fmtDate, slugify: slugify, rest: rest, listPublished: listPublished, getBySlug: getBySlug, md: md, card: card };
})();
