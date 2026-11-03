/* Nithil Innovations – site behaviour (no dependencies) */
(function () {
  "use strict";
  var C = window.NITHIL_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Fill contact details from config ---------- */
  var waUrl = "https://wa.me/" + (C.whatsappNumber || "") + "?text=" + encodeURIComponent(C.whatsappMessage || "");
  $$("[data-cfg]").forEach(function (el) {
    switch (el.getAttribute("data-cfg")) {
      case "phone": el.textContent = C.phoneDisplay; el.href = "tel:" + C.phoneTel; break;
      case "email": el.textContent = C.email; el.href = "mailto:" + C.email; break;
      case "location": el.textContent = C.location; break;
      case "whatsapp-btn": el.href = waUrl; break;
      case "phone-card": el.href = "tel:" + C.phoneTel; break;
      case "email-card": el.href = "mailto:" + C.email; break;
      case "phone-text": el.textContent = C.phoneDisplay; break;
      case "email-text": el.textContent = C.email; break;
      case "directions-btn": el.href = C.mapsUrl || ("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Nithil Innovations, " + C.location)); break;
      case "call-btn": el.href = "tel:" + C.phoneTel; break;
      case "email-btn": el.href = "mailto:" + C.email; break;
    }
  });

  /* ---------- Social icons (hidden if URL empty) ---------- */
  var names = { linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook", youtube: "YouTube" };
  $$("[data-social]").forEach(function (box) {
    Object.keys(names).forEach(function (k) {
      var url = C.social && C.social[k];
      if (!url) return;
      var a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.setAttribute("aria-label", names[k]);
      a.innerHTML = '<svg><use href="#i-' + k + '"/></svg>';
      box.appendChild(a);
    });
  });

  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Header: scroll state, mobile menu, active link ---------- */
  var header = $(".header"), toggle = $(".nav__toggle"), menu = $("#menu");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  function closeMenu() { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  var links = $$(".nav__links a[href^='#']:not(.btn)");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (l) { var s = $(l.getAttribute("href")); if (s) spy.observe(s); });

    /* ---------- Reveal on scroll ---------- */
    var rv = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); rv.unobserve(en.target); } });
    }, { threshold: 0.12 });
    $$(".reveal").forEach(function (el) { rv.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Interactive globe (amCharts 5, loaded only when near viewport) ---------- */
  var globeEl = $("#globe");
  function loadGlobe() {
    var sc = document.createElement("script");
    sc.src = "assets/vendor/globe.bundle.js";
    sc.onload = function () { try { window.NithilGlobe.init(globeEl); } catch (e) { globeFail(); } };
    sc.onerror = globeFail;
    document.body.appendChild(sc);
  }
  function globeFail() {
    globeEl.innerHTML = '<div class="globe-fallback">Interactive globe unavailable</div>';
  }
  if (globeEl) {
    if ("IntersectionObserver" in window) {
      var go = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { go.disconnect(); loadGlobe(); }
      }, { rootMargin: "400px 0px" });
      go.observe(globeEl);
    } else { loadGlobe(); }
  }

  /* ---------- Portfolio filter ---------- */
  var chips = $$(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.toggle("on", c === chip); });
      var f = chip.getAttribute("data-filter");
      $$(".project").forEach(function (p) { p.hidden = !(f === "all" || p.getAttribute("data-cat") === f); });
    });
  });

  /* ---------- "Request a quote" links preselect the service ---------- */
  $$("[data-service]").forEach(function (a) {
    a.addEventListener("click", function () {
      var sel = $("#f-service"), want = a.getAttribute("data-service");
      $$("option", sel).forEach(function (o) { if (o.textContent.trim() === want) sel.value = o.value || o.textContent; });
    });
  });

  /* ---------- Enquiry form ---------- */
  var form = $("#enquiry-form"), status = $("#form-status"), btn = $("#submit-btn");
  function show(type, msg) { status.className = "form__status " + type; status.textContent = msg; }

  function mailtoFallback(d) {
    var body = "Name: " + d.name + "\nCompany: " + (d.company || "-") + "\nEmail: " + d.email + "\nPhone: " + d.phone +
               "\nService: " + d.service + "\n\nProject description:\n" + d.message;
    window.location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent((C.form && C.form.subject) || "Website enquiry") +
                           "&body=" + encodeURIComponent(body);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.className = "form__status";
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var d = {};
    new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
    if (d.botcheck) return; // honeypot: silently drop bots

    var cfg = C.form || {};
    if (!cfg.accessKey) {
      show("info", "Opening your email app with the enquiry pre-filled. Please press Send to deliver it.");
      mailtoFallback(d);
      return;
    }

    btn.disabled = true;
    var label = btn.firstChild.textContent; btn.firstChild.textContent = "Sending… ";
    fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        access_key: cfg.accessKey,
        subject: cfg.subject,
        from_name: "Nithil Innovations Website",
        name: d.name, company: d.company, email: d.email, phone: d.phone, service: d.service, message: d.message,
        replyto: d.email
      })
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.success !== false, j: j }; }); })
      .then(function (res) {
        if (res.ok) { show("ok", "Thank you! Your enquiry has been sent. Our team will contact you shortly."); form.reset(); }
        else { throw new Error((res.j && res.j.message) || "Failed"); }
      })
      .catch(function () {
        show("err", "Sorry, we couldn't send your enquiry. Please call or WhatsApp us on " + C.phoneDisplay + " or email " + C.email + ".");
      })
      .finally(function () { btn.disabled = false; btn.firstChild.textContent = label; });
  });
})();
