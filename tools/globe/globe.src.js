/*
 * Rotating 3D globe for the "Build Smarter. Move Faster." section.
 * Vanilla-JS port of the supplied amCharts 5 Chart Maker (React) config:
 * orthographic projection, rotateX/rotateY panning, 30s auto-rotation,
 * transparent background, country hover, zoom + home controls.
 */
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";

function init(el, opts) {
  opts = opts || {};
  var land = am5.color(0xc9d8f3), hover = am5.color(0x2563eb), sea = am5.color(0xeaf1fd);
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var root = am5.Root.new(el);
  root.setThemes([am5themes_Animated.new(root)]);
  root.interfaceColors.set("primaryButton", am5.color(0xffffff));
  root.interfaceColors.set("primaryButtonHover", am5.color(0xeff4ff));
  root.interfaceColors.set("primaryButtonText", am5.color(0x0a1022));
  root.interfaceColors.set("primaryButtonActive", am5.color(0xdbe7ff));
  root.interfaceColors.set("alternativeText", am5.color(0x0a1022));

  var chart = root.container.children.push(am5map.MapChart.new(root, {
    projection: am5map.geoOrthographic(),
    panX: "rotateX", panY: "rotateY",
    rotationX: -77.7, rotationY: -15, // start facing India (Erode)
    minZoomLevel: 0.5, zoomLevel: 0.95, homeZoomLevel: 0.95, autoHome: true,
    animationDuration: 800, boxZoom: "shift",
    wheelY: "none", wheelX: "none" // keep page scrolling; use +/- buttons or pinch
  }));

  // Transparent chart background (blends with the white page)
  chart.chartContainer.get("background").setAll({ fill: am5.color(0xffffff), fillOpacity: 0 });

  // Zoom + home controls
  var zc = chart.set("zoomControl", am5map.ZoomControl.new(root, {}));
  zc.homeButton.set("visible", true);

  // Soft sphere (whole-world rectangle), as in the reference config
  var sphere = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
  sphere.mapPolygons.template.setAll({ fill: sea, fillOpacity: 0.9, strokeOpacity: 0 });
  sphere.data.push({ geometry: am5map.getGeoRectangle(90, 180, -90, -180) });

  // Graticule
  var grat = chart.series.push(am5map.GraticuleSeries.new(root, {}));
  grat.mapLines.template.setAll({ stroke: am5.color(0x2563eb), strokeOpacity: 0.1 });

  // Countries
  var countries = chart.series.push(am5map.MapPolygonSeries.new(root, {
    geoJSON: am5geodata_worldLow, exclude: ["AQ"]
  }));
  countries.mapPolygons.template.setAll({
    tooltipText: "{name}", interactive: true, fill: land, stroke: am5.color(0xffffff), strokeWidth: 0.5
  });
  countries.mapPolygons.template.states.create("hover", { fill: hover, fillOpacity: 1 });
  countries.mapPolygons.template.states.create("active", { fill: hover, fillOpacity: 1 });

  // HQ marker (Erode, Tamil Nadu)
  var pts = chart.series.push(am5map.MapPointSeries.new(root, {}));
  pts.bullets.push(function () {
    var c = am5.Container.new(root, {});
    var pulse = c.children.push(am5.Circle.new(root, { radius: 6, fill: am5.color(0xfbbc06), fillOpacity: 0.5 }));
    if (!reduce) {
      pulse.animate({ key: "radius", from: 6, to: 20, duration: 1800, loops: Infinity });
      pulse.animate({ key: "fillOpacity", from: 0.5, to: 0, duration: 1800, loops: Infinity });
    }
    c.children.push(am5.Circle.new(root, {
      radius: 5, fill: am5.color(0xfbbc06), stroke: am5.color(0x0a1022), strokeWidth: 1.5,
      tooltipText: "Nithil Innovations – Erode, Tamil Nadu", cursorOverStyle: "pointer"
    }));
    return am5.Bullet.new(root, { sprite: c });
  });
  pts.data.push({ geometry: { type: "Point", coordinates: [77.7172, 11.341] } });

  // Smooth auto-rotation; pauses while the user hovers/drags, resumes after
  var spinning = null;
  function spin() {
    if (reduce || spinning) return;
    var from = chart.get("rotationX");
    spinning = chart.animate({ key: "rotationX", from: from, to: from + 360, duration: 30000, loops: Infinity, easing: am5.ease.linear });
  }
  function pause() { if (spinning) { spinning.stop(); spinning = null; } }
  chart.chartContainer.events.on("pointerover", pause);
  chart.chartContainer.events.on("pointerout", spin);
  chart.appear(1000, 100);
  spin();

  return { root: root, chart: chart };
}

window.NithilGlobe = { init: init };
