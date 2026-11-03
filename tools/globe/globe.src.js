/*
 * Rotating 3D globe (orthographic) – d3-geo + Natural Earth data (public domain).
 * Auto-rotation (~30 s/turn), drag to rotate, country hover, zoom / home buttons,
 * transparent canvas so it blends with the page background.
 */
import { geoOrthographic, geoPath, geoGraticule10, geoContains, geoDistance } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";

var HQ = [77.6076, 11.1609]; // Chennimalai, Tamil Nadu

function init(el) {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var countries = feature(world, world.objects.countries).features.filter(function (f) { return f.properties.name !== "Antarctica"; });
  var sphere = { type: "Sphere" }, grat = geoGraticule10();

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  var tip = document.createElement("div"); tip.className = "globe-tip";
  var ctrl = document.createElement("div"); ctrl.className = "globe-ctrl";
  ctrl.innerHTML = '<button type="button" data-z="in" aria-label="Zoom in">+</button><button type="button" data-z="out" aria-label="Zoom out">−</button><button type="button" data-z="home" aria-label="Reset view">⌂</button>';
  el.appendChild(canvas); el.appendChild(tip); el.appendChild(ctrl);
  var ctx = canvas.getContext("2d");

  var proj = geoOrthographic().clipAngle(90).precision(0.5);
  var path = geoPath(proj, ctx);
  var rot = [-HQ[0], -15], k = 1, kt = 1, w = 0, h = 0, base = 100;
  var hover = null, dragging = false, last = null, paused = false, visible = true, resumeAt = 0;

  function resize() {
    var r = el.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    base = Math.min(w, h) / 2 - 6;
  }

  function draw() {
    proj.scale(base * k).translate([w / 2, h / 2]).rotate(rot);
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath(); path(sphere); ctx.fillStyle = "#F3F4F6"; ctx.fill(); ctx.strokeStyle = "#E5E7EB"; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); path(grat); ctx.strokeStyle = "rgba(107,114,128,.18)"; ctx.lineWidth = 0.5; ctx.stroke();
    ctx.lineWidth = 0.6; ctx.strokeStyle = "#fff";
    for (var i = 0; i < countries.length; i++) {
      ctx.beginPath(); path(countries[i]);
      ctx.fillStyle = countries[i] === hover ? "#374151" : "#D5DAE1"; ctx.fill(); ctx.stroke();
    }
    // HQ marker (only when on the visible hemisphere)
    if (geoDistance(HQ, [-rot[0], -rot[1]]) < Math.PI / 2 - 0.05) {
      var p = proj(HQ);
      ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, 6.283); ctx.fillStyle = "rgba(251,188,6,.28)"; ctx.fill();
      ctx.beginPath(); ctx.arc(p[0], p[1], 4.5, 0, 6.283); ctx.fillStyle = "#FBBC06"; ctx.fill(); ctx.strokeStyle = "#111827"; ctx.lineWidth = 1.2; ctx.stroke();
    }
  }

  var prev = 0;
  function frame(t) {
    var dt = prev ? Math.min(t - prev, 60) : 16; prev = t;
    if (visible) {
      if (Math.abs(kt - k) > 0.002) k += (kt - k) * 0.15; else k = kt;
      if (!reduce && !paused && !dragging && t > resumeAt) rot[0] += dt * 0.012; // 12°/s ≈ 30 s per turn
      draw();
    }
    requestAnimationFrame(frame);
  }

  function pos(e) { var r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function pick(p) {
    var inv = proj.invert(p); if (!inv) return null;
    if (geoDistance(inv, [-rot[0], -rot[1]]) > Math.PI / 2) return null;
    for (var i = 0; i < countries.length; i++) if (geoContains(countries[i], inv)) return countries[i];
    return null;
  }
  canvas.addEventListener("pointerdown", function (e) { dragging = true; last = [e.clientX, e.clientY]; canvas.setPointerCapture(e.pointerId); el.classList.add("grab"); });
  canvas.addEventListener("pointermove", function (e) {
    if (dragging) {
      var s = 0.3 / k; rot[0] += (e.clientX - last[0]) * s; rot[1] = Math.max(-80, Math.min(80, rot[1] - (e.clientY - last[1]) * s)); last = [e.clientX, e.clientY]; tip.style.opacity = 0; return;
    }
    var p = pos(e); hover = pick(p); paused = true;
    if (hover) { tip.textContent = hover.properties.name; tip.style.left = p[0] + "px"; tip.style.top = p[1] + "px"; tip.style.opacity = 1; } else tip.style.opacity = 0;
  });
  function release() { dragging = false; el.classList.remove("grab"); }
  canvas.addEventListener("pointerup", release); canvas.addEventListener("pointercancel", release);
  canvas.addEventListener("pointerleave", function () { hover = null; paused = false; tip.style.opacity = 0; resumeAt = performance.now() + 600; });
  ctrl.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return; var a = b.getAttribute("data-z");
    if (a === "in") kt = Math.min(2.6, kt * 1.35); else if (a === "out") kt = Math.max(0.6, kt / 1.35); else { kt = 1; rot = [-HQ[0], -15]; }
  });

  if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(el);
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(el); else window.addEventListener("resize", resize);
  resize(); requestAnimationFrame(frame);
}
window.NithilGlobe = { init: init };
