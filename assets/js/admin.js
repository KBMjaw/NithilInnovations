/* Blog admin – Supabase Auth (email/password) + REST + Storage, no SDK. */
(function () {
  "use strict";
  var B = window.NithilBlog, C = window.NITHIL_CONFIG || {}, S = C.supabase || {};
  var $ = function (id) { return document.getElementById(id); };
  var KEY = "nithil_admin_session", session = null, current = null, slugTouched = false;

  var views = ["view-login", "view-list", "view-edit"];
  function show(v) { views.forEach(function (x) { $(x).hidden = x !== v; }); $("user").hidden = v === "view-login"; }
  function notice(t) { var n = $("notice"); n.textContent = t || ""; n.hidden = !t; }
  function setStatus(id, t, cls) { var el = $(id); el.textContent = t || ""; el.className = "status" + (cls ? " " + cls : ""); }

  if (!B || !B.configured()) { show("view-login"); $("login-form").hidden = true; notice("Blog backend isn't configured yet. Add the Supabase URL and key in assets/js/config.js (see README)."); return; }

  /* ---------- Auth ---------- */
  var base = S.url.replace(/\/$/, "");
  function auth(path, body) {
    return fetch(base + "/auth/v1/" + path, { method: "POST", headers: { apikey: S.anonKey, "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error_description || j.msg || j.message || "Sign-in failed"); return j; }); });
  }
  function save(j) {
    session = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in || 3600) * 1000, email: (j.user && j.user.email) || (session && session.email) || "" };
    try { localStorage.setItem(KEY, JSON.stringify(session)); } catch (e) {}
  }
  function load() { try { session = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { session = null; } }
  function logout() { session = null; try { localStorage.removeItem(KEY); } catch (e) {} current = null; show("view-login"); }
  function token() {
    if (!session) return Promise.reject(new Error("Not signed in"));
    if (session.expires_at - Date.now() > 60000) return Promise.resolve(session.access_token);
    return auth("token?grant_type=refresh_token", { refresh_token: session.refresh_token }).then(function (j) { save(j); return session.access_token; })
      .catch(function (e) { logout(); throw e; });
  }
  function api(path, opts) { return token().then(function (t) { return B.rest(path, opts, t); }); }

  $("login-form").addEventListener("submit", function (e) {
    e.preventDefault(); var btn = $("login-btn"); btn.disabled = true; setStatus("login-status", "Signing in…");
    auth("token?grant_type=password", { email: $("email").value.trim(), password: $("password").value })
      .then(function (j) { save(j); return enter(); })
      .catch(function (err) { setStatus("login-status", err.message, "err"); })
      .finally(function () { btn.disabled = false; });
  });
  $("logout").addEventListener("click", logout);

  function enter() {
    notice("");
    return api("blog_admins?select=user_id").then(function (r) {
      if (!r.length) { logout(); notice("This account is not authorised to manage the blog."); return; }
      $("user-email").textContent = session.email; return showList();
    });
  }

  /* ---------- List ---------- */
  function showList() {
    show("view-list");
    return api("posts?select=id,title,slug,status,published_at,updated_at&order=updated_at.desc").then(function (rows) {
      $("empty").hidden = rows.length > 0;
      $("rows").innerHTML = rows.map(function (p) {
        return "<tr><td>" + B.esc(p.title) + '</td><td><span class="badge ' + (p.status === "published" ? "pub" : "") + '">' + p.status + "</span></td><td>" + B.esc(B.fmtDate(p.updated_at)) +
          '</td><td class="act"><button data-edit="' + p.id + '">Edit</button>' +
          (p.status === "published" ? '<a class="mini" target="_blank" rel="noopener" href="../blog/post.html?slug=' + encodeURIComponent(p.slug) + '">View</a>' : "") + "</td></tr>";
      }).join("");
    }).catch(function (e) { notice(e.message); });
  }
  $("rows").addEventListener("click", function (e) { var id = e.target.getAttribute("data-edit"); if (id) openPost(id); });
  $("new-post").addEventListener("click", function () { edit({ title: "", slug: "", excerpt: "", content: "", cover_image: "", status: "draft" }); });
  $("back").addEventListener("click", showList);
  function openPost(id) {
    api("posts?select=*&id=eq." + id + "&limit=1").then(function (r) { if (r[0]) edit(r[0]); }).catch(function (e) { notice(e.message); });
  }

  /* ---------- Editor ---------- */
  function edit(p) {
    current = p; slugTouched = !!p.id; show("view-edit"); notice(""); setStatus("edit-status", "");
    $("edit-heading").textContent = p.id ? "Edit post" : "New post";
    $("p-title").value = p.title || ""; $("p-slug").value = p.slug || ""; $("p-excerpt").value = p.excerpt || "";
    $("p-content").value = p.content || ""; $("p-cover").value = p.cover_image || "";
    $("preview").hidden = true; $("p-content").hidden = false; $("toggle-preview").textContent = "Preview";
    refresh();
  }
  function refresh() {
    var pub = current && current.status === "published";
    $("p-status").textContent = pub ? "Published" : "Draft";
    $("publish").textContent = pub ? "Update" : "Publish"; $("unpublish").hidden = !pub;
    $("delete").hidden = !(current && current.id);
    var live = $("view-live"); live.hidden = !pub; if (pub) live.href = "../blog/post.html?slug=" + encodeURIComponent(current.slug);
    var c = $("p-cover").value.trim(), img = $("cover-preview"); img.hidden = !c; if (c) img.src = c;
  }
  $("p-title").addEventListener("input", function () { if (!slugTouched) $("p-slug").value = B.slugify($("p-title").value); });
  $("p-slug").addEventListener("input", function () { slugTouched = true; });
  $("p-cover").addEventListener("change", refresh);
  $("toggle-preview").addEventListener("click", function () {
    var on = $("preview").hidden; $("preview").hidden = !on; $("p-content").hidden = on;
    $("toggle-preview").textContent = on ? "Edit" : "Preview"; if (on) $("preview").innerHTML = B.md($("p-content").value);
  });

  function persist(status) {
    var title = $("p-title").value.trim(), slug = B.slugify($("p-slug").value || title);
    if (!title) return setStatus("edit-status", "Title is required.", "err");
    if (!slug) return setStatus("edit-status", "A URL slug is required.", "err");
    var body = { title: title, slug: slug, excerpt: $("p-excerpt").value.trim() || null, content: $("p-content").value, cover_image: $("p-cover").value.trim() || null, status: status };
    if (status === "published" && !current.published_at) body.published_at = new Date().toISOString();
    setStatus("edit-status", "Saving…");
    var req = current.id
      ? api("posts?id=eq." + current.id, { method: "PATCH", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(body) })
      : api("posts", { method: "POST", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(body) });
    req.then(function (r) {
      current = r[0]; $("p-slug").value = current.slug; $("edit-heading").textContent = "Edit post"; refresh();
      setStatus("edit-status", status === "published" ? "Published ✓" : "Saved ✓", "ok");
    }).catch(function (e) { setStatus("edit-status", /duplicate|unique/i.test(e.message) ? "That slug is already used – choose another." : e.message, "err"); });
  }
  $("save-draft").addEventListener("click", function () { persist(current && current.status === "published" ? "published" : "draft"); });
  $("publish").addEventListener("click", function () { persist("published"); });
  $("unpublish").addEventListener("click", function () { persist("draft"); });
  $("delete").addEventListener("click", function () {
    if (!current.id || !confirm("Delete this post permanently?")) return;
    api("posts?id=eq." + current.id, { method: "DELETE" }).then(showList).catch(function (e) { setStatus("edit-status", e.message, "err"); });
  });

  /* ---------- Markdown toolbar & image upload ---------- */
  var ta = $("p-content"), fileEl = $("file"), uploadTarget = null;
  function wrap(a, b, ph) {
    var s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e) || ph;
    ta.setRangeText(a + sel + b, s, e, "end"); ta.focus();
  }
  $("tools").addEventListener("click", function (e) {
    var k = e.target.closest("button[data-md]"); if (!k) return; k = k.getAttribute("data-md");
    if (k === "b") wrap("**", "**", "bold text"); else if (k === "i") wrap("*", "*", "italic"); else if (k === "h2") wrap("\n## ", "\n", "Heading");
    else if (k === "ul") wrap("\n- ", "\n", "List item"); else if (k === "link") { var u = prompt("Link URL (https://…)"); if (u) wrap("[", "](" + u + ")", "link text"); }
    else if (k === "img") { uploadTarget = "content"; fileEl.click(); }
  });
  $("upload-cover").addEventListener("click", function () { uploadTarget = "cover"; fileEl.click(); });
  fileEl.addEventListener("change", function () {
    var f = fileEl.files[0]; fileEl.value = ""; if (!f) return;
    if (f.size > 5 * 1024 * 1024) return setStatus("edit-status", "Image must be under 5 MB.", "err");
    var path = Date.now() + "-" + f.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    setStatus("edit-status", "Uploading image…");
    token().then(function (t) {
      return fetch(base + "/storage/v1/object/blog-images/" + path, { method: "POST", headers: { apikey: S.anonKey, Authorization: "Bearer " + t, "Content-Type": f.type, "x-upsert": "false" }, body: f });
    }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.message || "Upload failed"); return j; }); })
      .then(function () {
        var url = base + "/storage/v1/object/public/blog-images/" + path;
        if (uploadTarget === "cover") { $("p-cover").value = url; refresh(); } else wrap("\n![", "](" + url + ")\n", "image");
        setStatus("edit-status", "Image uploaded ✓", "ok");
      }).catch(function (e) { setStatus("edit-status", e.message, "err"); });
  });

  /* ---------- Boot ---------- */
  load();
  if (session) enter().catch(function () { logout(); }); else show("view-login");
})();
