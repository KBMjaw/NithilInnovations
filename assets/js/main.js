/* Nithil Innovations – site behaviour (no dependencies) */
(function () {
  "use strict";
  var C = window.NITHIL_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Contact details from config ---------- */
  var wa = "https://wa.me/" + (C.whatsappNumber || "") + "?text=" + encodeURIComponent(C.whatsappMessage || "");
  $$("[data-cfg]").forEach(function (el) {
    var k = el.getAttribute("data-cfg");
    if (k === "phone") el.href = "tel:" + C.phoneTel;
    else if (k === "email") el.href = "mailto:" + C.email;
    else if (k === "whatsapp") el.href = wa;
  });
  var text = { phone: C.phoneDisplay, email: C.email, address: C.address };
  $$("[data-cfg-text]").forEach(function (el) { el.textContent = text[el.getAttribute("data-cfg-text")] || ""; });

  var names = { linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook", youtube: "YouTube" };
  $$("[data-social]").forEach(function (box) {
    Object.keys(names).forEach(function (k) {
      var url = C.social && C.social[k]; if (!url) return;
      var a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.setAttribute("aria-label", names[k]);
      a.innerHTML = '<svg><use href="#i-' + k + '"/></svg>';
      box.appendChild(a);
    });
  });
  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Header ---------- */
  var header = $(".header"), toggle = $(".nav__toggle"), menu = $("#menu");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  function closeMenu() { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  toggle.addEventListener("click", function () { toggle.setAttribute("aria-expanded", String(menu.classList.toggle("open"))); });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  var links = $$(".nav__links a[href^='#']");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + x.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (l) { var s = $(l.getAttribute("href")); if (s) spy.observe(s); });

    var rv = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); rv.unobserve(x.target); } });
    }, { threshold: 0.1 });
    $$(".reveal").forEach(function (el) { rv.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- Globe (lazy-loaded when near viewport) ---------- */
  var globe = $("#globe");
  function loadGlobe() {
    var s = document.createElement("script");
    s.src = "assets/vendor/globe.bundle.js?v=20261105";
    s.onload = function () { try { window.NithilGlobe.init(globe); } catch (e) {} };
    document.body.appendChild(s);
  }
  if (globe) {
    if ("IntersectionObserver" in window) {
      var go = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { go.disconnect(); loadGlobe(); } }, { rootMargin: "400px 0px" });
      go.observe(globe);
    } else loadGlobe();
  }

  /* ---------- Enquiry form ---------- */
  /* ---------- Latest posts on the home page ---------- */
  var homePosts = $("#home-posts");
  if (homePosts && window.NithilBlog && NithilBlog.configured()) {
    NithilBlog.listPublished(3).then(function (posts) {
      if (!posts.length) return;
      homePosts.innerHTML = posts.map(function (p) { return NithilBlog.card(p, "blog/"); }).join("");
      $("#blog").hidden = false;
    }).catch(function () {});
  }

  var form = $("#enquiry-form"), status = $("#form-status"), btn = $("#submit-btn");
  if (!form) return;
  function show(type, msg) { status.className = "form__status " + type; status.textContent = msg; }
  function mailto(d) {
    var body = "Name: " + d.name + "\nCompany: " + (d.company || "-") + "\nEmail: " + d.email + "\nPhone: " + d.phone +
               "\nService: " + d.service + "\n\nProject description:\n" + d.message;
    window.location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent((C.form && C.form.subject) || "Website enquiry") + "&body=" + encodeURIComponent(body);
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault(); status.className = "form__status";
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var d = {}; new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
    if (d.botcheck) return;
    var cfg = C.form || {};
    if (!cfg.accessKey) { show("info", "Opening your email app with the enquiry pre-filled. Please press Send to deliver it."); mailto(d); return; }
    btn.disabled = true; var label = btn.firstChild.textContent; btn.firstChild.textContent = "Sending… ";
    fetch(cfg.endpoint, {
      method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ access_key: cfg.accessKey, subject: cfg.subject, from_name: "Nithil Innovations Website",
        name: d.name, company: d.company, email: d.email, phone: d.phone, service: d.service, message: d.message, replyto: d.email })
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.success !== false, j: j }; }); })
      .then(function (res) { if (res.ok) { show("ok", "Thank you! Your enquiry has been sent. We'll contact you shortly."); form.reset(); } else throw new Error(); })
      .catch(function () { show("err", "Sorry, we couldn't send your enquiry. Please call or WhatsApp " + C.phoneDisplay + " or email " + C.email + "."); })
      .finally(function () { btn.disabled = false; btn.firstChild.textContent = label; });
  });
})();
