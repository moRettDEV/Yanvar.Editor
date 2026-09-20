var PLOT_BLUE = "#6ea8ff";
var PLOT_GREEN = "#5dde8a";

function contentWidth(el) {
  if (!el) return 0;
  var w = el.clientWidth;
  if (!w) return 0;
  var cs = window.getComputedStyle(el);
  return Math.max(0, w - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0));
}

function canvasSize(canvas, fallbackW, fallbackH) {
  var host = canvas.parentElement;
  var w = host && host.clientWidth >= 200 ? host.clientWidth : contentWidth(document.getElementById("detail"));
  if (w < 200) w = fallbackW;
  var h = fallbackH || 480;
  return { w: Math.round(w), h: Math.round(h) };
}

function fillCanvas(canvas, w, h) {
  var dpr = window.devicePixelRatio || 1;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  var ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function strokePts(ctx, pts, color, width) {
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.beginPath();
  var started = false;
  for (var k = 0; k < pts.length; k++) {
    if (!pts[k]) {
      started = false;
      continue;
    }
    if (!started) {
      ctx.moveTo(pts[k].x, pts[k].y);
      started = true;
    } else ctx.lineTo(pts[k].x, pts[k].y);
  }
  ctx.stroke();
}

function collectPts(pts, hit) {
  if (!hit) return;
  for (var k = 0; k < pts.length; k++) {
    if (pts[k]) hit.push(pts[k]);
  }
}

function drawVertexMarks(ctx, pts, color, digits, opts) {
  opts = opts || {};
  var showLabel = opts.label !== false;
  var n = 0;
  var k;
  for (k = 0; k < pts.length; k++) if (pts[k]) n++;
  var every = opts.labelEvery > 1 ? opts.labelEvery : (n > 32 ? Math.round((n - 1) / 15) : 0);
  var alt = opts.alt != null ? opts.alt : (every ? false : n > 18);
  var side = opts.side || "up";
  var rad = opts.r || (n > 64 ? 2.2 : 3.6);
  ctx.font = "10px Segoe UI, Tahoma, sans-serif";
  ctx.textAlign = "center";
  for (k = 0; k < pts.length; k++) {
    var p = pts[k];
    if (!p) continue;
    ctx.beginPath();
    ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = "rgba(8,10,16,0.7)";
    ctx.stroke();
    var labeled = showLabel && (!every || k === 0 || k === pts.length - 1 || k % every === 0);
    if (!labeled) continue;
    var lab = typeof fmtPoint === "function" ? fmtPoint(p.v, digits) : String(p.v);
    var up = side === "down" ? false : side === "alt" ? k % 2 === 0 : !alt || k % 2 === 0;
    var ty = p.y + (up ? -7 : 7);
    ctx.textBaseline = up ? "bottom" : "top";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = "rgba(12,14,18,0.88)";
    ctx.strokeText(lab, p.x, ty);
    ctx.fillStyle = color;
    ctx.fillText(lab, p.x, ty);
  }
}

function drawCtp2d(canvas, bytes, rows, cols, item, opts) {
  opts = opts || {};
  var pack = tableCells(bytes, rows, cols, item);
  var scale = pack.scale;
  var active = opts.row == null ? 0 : opts.row;
  if (active < 0) active = 0;
  if (active >= rows) active = rows - 1;
  var overlay = opts.overlay || [];
  var blueVals = pack.cells.filter(function (p) { return p.r === active && p.v != null && isFinite(p.v); }).map(function (p) { return p.v; });
  var hideBlue = false;
  var hasOverlay = overlay.some(function (v) { return v != null && isFinite(v); });
  if (opts.hideFlatBlue && hasOverlay) {
    hideBlue = true;
  } else if (opts.hideFlatBlue && blueVals.length) {
    var bmin = Math.min.apply(null, blueVals);
    var bmax = Math.max.apply(null, blueVals);
    hideBlue = bmax - bmin < 0.51 && bmax < 0;
  }
  var vals = hideBlue ? [] : blueVals.slice();
  var i;
  for (i = 0; i < overlay.length; i++) {
    if (overlay[i] != null && isFinite(overlay[i])) vals.push(overlay[i]);
  }
  var vmin = vals.length ? Math.min.apply(null, vals) : 0;
  var vmax = vals.length ? Math.max.apply(null, vals) : 1;
  var y0 = scale.auto ? Math.min(0, vmin) : (scale.yMin != null ? scale.yMin : Math.min(0, vmin));
  var y1 = scale.auto ? vmax + (vmax - vmin) * 0.15 + 0.05 : (scale.yMax != null ? scale.yMax : vmax);
  if (scale.auto && overlay.some(function (v) { return v != null && isFinite(v); })) {
    y0 = Math.min(y0, vmin);
    y1 = Math.max(y1, vmax + (vmax - vmin) * 0.12 + 0.05);
  }
  if (!(y1 > y0)) y1 = y0 + 1;
  var yt = niceTicks(y0, y1, 12, scale.yStep);
  var xAx = pack.xAx || { min: 0, max: Math.max(1, (cols || 1) - 1), step: 1 };
  var xEqual = !!(xAx.values && xAx.values.length === cols);
  var xt;
  if (xEqual) {
    xt = { min: 0, max: Math.max(1, cols - 1), ticks: [], step: 1 };
    var stride = cols > 26 ? Math.round((cols - 1) / 25) : 1;
    for (i = 0; i < cols; i++) {
      if (i === 0 || i === cols - 1 || i % stride === 0) xt.ticks.push(i);
    }
  } else {
    var xWant = cols >= 64 ? 26 : 10;
    var xStepFix = xAx.step;
    if (xStepFix && (xAx.max - xAx.min) / xStepFix > xWant + 2) xStepFix = null;
    xt = niceTicks(xAx.min, xAx.max, xWant, xStepFix);
  }
  var sz = canvasSize(canvas, 960, 480);
  var w = sz.w, h = sz.h;
  var pad = { l: 78, r: 36, t: 52, b: 70 };
  var ctx = fillCanvas(canvas, w, h);
  var iw = w - pad.l - pad.r;
  var ih = h - pad.t - pad.b;
  function px(x) { return pad.l + ((x - xt.min) / (xt.max - xt.min)) * iw; }
  function py(v) { return pad.t + (1 - (v - yt.min) / (yt.max - yt.min)) * ih; }

  ctx.fillStyle = "#16181f";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#12141a";
  ctx.fillRect(pad.l, pad.t, iw, ih);
  ctx.strokeStyle = "#2a2e3a";
  ctx.lineWidth = 1;
  for (i = 0; i < yt.ticks.length; i++) {
    var y = py(yt.ticks[i]);
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(pad.l + iw, y);
    ctx.stroke();
  }
  for (i = 0; i < xt.ticks.length; i++) {
    var x = px(xt.ticks[i]);
    ctx.beginPath();
    ctx.moveTo(x, pad.t);
    ctx.lineTo(x, pad.t + ih);
    ctx.stroke();
  }
  ctx.strokeStyle = "#3a3f4e";
  ctx.strokeRect(pad.l, pad.t, iw, ih);

  ctx.fillStyle = "#e8eaed";
  ctx.font = "15px Segoe UI, Tahoma, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(item && item.name ? item.name : "", w / 2, 28);
  ctx.font = "11px Segoe UI, Tahoma, sans-serif";
  ctx.fillStyle = "#9aa0ad";
  for (i = 0; i < yt.ticks.length; i++) {
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(fmtTick(yt.ticks[i], scale.axisDigits != null ? scale.axisDigits : scale.digits), pad.l - 8, py(yt.ticks[i]));
  }
  for (i = 0; i < xt.ticks.length; i++) {
    var tx = px(xt.ticks[i]);
    var ty = pad.t + ih;
    ctx.beginPath();
    ctx.arc(tx, ty, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = "#d7dde8";
    ctx.fill();
    ctx.strokeStyle = "rgba(8,10,16,0.55)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#9aa0ad";
    ctx.fillText(
      fmtTick(xEqual ? xAx.values[xt.ticks[i]] : xt.ticks[i], pack.xAx.digits),
      tx,
      ty + 8
    );
  }
  ctx.save();
  ctx.translate(18, pad.t + ih / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "12px Segoe UI, Tahoma, sans-serif";
  ctx.fillText(scale.yLabel || "", 0, 0);
  ctx.restore();
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(pack.xAx.label || "", pad.l + iw / 2, h - 10);

  ctx.font = "11px Segoe UI, Tahoma, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  if (!hideBlue) {
    ctx.fillStyle = PLOT_BLUE;
    ctx.fillRect(pad.l + iw - 132, pad.t + 10, 10, 10);
    ctx.fillStyle = "#c5c9d4";
    ctx.fillText("\u0432\u044c\u044e\u0435\u0440", pad.l + iw - 118, pad.t + 15);
    ctx.fillStyle = PLOT_GREEN;
    ctx.fillRect(pad.l + iw - 132, pad.t + 26, 10, 10);
    ctx.fillStyle = "#c5c9d4";
    ctx.fillText("CTP", pad.l + iw - 118, pad.t + 31);
  }

  var hit = [];
  function rowPts(rr, useV) {
    var cells = pack.cells.filter(function (p) { return p.r === rr; });
    return cells.map(function (p, k) {
      var v = useV ? useV[k] : p.v;
      if (v == null || !isFinite(v)) return null;
      return {
        x: px(xEqual ? p.c : p.x),
        y: py(v),
        v: v,
        raw: p.raw,
        xv: p.x,
        r: p.r,
        c: p.c,
        tag: useV ? "green" : "blue"
      };
    });
  }
  function drawRow(rr, strong) {
    var pts = rowPts(rr, null);
    var color = strong
      ? PLOT_BLUE
      : "hsla(" + Math.round((rr / Math.max(1, rows - 1)) * 280) + ",70%,40%," + (strong ? 1 : 0.35) + ")";
    strokePts(ctx, pts, color, strong ? 2 : 1);
    if (!strong && rows > 1) return;
    collectPts(pts, hit);
  }
  if (opts.onlyActive === false) {
    for (i = 0; i < rows; i++) if (i !== active) drawRow(i, false);
  }
  if (!hideBlue) drawRow(active, true);
  var bluePts = hideBlue ? [] : rowPts(active, null);
  var greenPts = rowPts(active, overlay);
  var hasGreen = greenPts.some(function (p) { return p; });
  var markOpt = { labelEvery: opts.labelEvery, r: cols > 64 ? 2.2 : 3.6 };
  if (hasGreen && hideBlue) {
    strokePts(ctx, greenPts, PLOT_BLUE, 2.2);
    collectPts(greenPts, hit);
    drawVertexMarks(ctx, greenPts, PLOT_BLUE, scale.digits, markOpt);
  } else if (hasGreen) {
    strokePts(ctx, greenPts, PLOT_GREEN, 2.5);
    collectPts(greenPts, hit);
    drawVertexMarks(ctx, bluePts, PLOT_BLUE, scale.digits, { side: "up", labelEvery: markOpt.labelEvery, r: markOpt.r });
    drawVertexMarks(ctx, greenPts, PLOT_GREEN, scale.digits, { side: "down", labelEvery: markOpt.labelEvery, r: markOpt.r });
  } else {
    drawVertexMarks(ctx, bluePts, PLOT_BLUE, scale.digits, markOpt);
  }

  canvas._plot = {
    pad: pad,
    w: w,
    h: h,
    xt: xt,
    yt: yt,
    scale: scale,
    xAx: xAx,
    hit: hit,
    cols: pack.cells.filter(function (p) { return p.r === active; }),
    active: active
  };
}

function plotPointer(canvas, e) {
  var plot = canvas._plot;
  if (!plot) return null;
  var rect = canvas.getBoundingClientRect();
  var mx = (e.clientX - rect.left) * (plot.w / rect.width);
  var my = (e.clientY - rect.top) * (plot.h / rect.height);
  var iw = plot.w - plot.pad.l - plot.pad.r;
  var ih = plot.h - plot.pad.t - plot.pad.b;
  var xVal = plot.xt.min + ((mx - plot.pad.l) / iw) * (plot.xt.max - plot.xt.min);
  var yVal = plot.yt.max - ((my - plot.pad.t) / ih) * (plot.yt.max - plot.yt.min);
  return { plot: plot, rect: rect, mx: mx, my: my, xVal: xVal, yVal: yVal };
}

function nearestPlotCol(plot, mx) {
  var cells = plot.cols || [];
  var best = null;
  var bestD = 1e9;
  for (var i = 0; i < cells.length; i++) {
    var x = plot.pad.l + ((cells[i].x - plot.xt.min) / (plot.xt.max - plot.xt.min)) * (plot.w - plot.pad.l - plot.pad.r);
    var d = Math.abs(x - mx);
    if (d < bestD) {
      bestD = d;
      best = cells[i];
    }
  }
  return best ? { cell: best, dist: bestD } : null;
}

function attachPlotHover(canvas, onSet, onDragEnd) {
  canvas._onSet = onSet;
  canvas._onDragEnd = onDragEnd;
  var host = canvas.parentNode;
  if (!host) return;
  host.style.position = "relative";
  var tip = host.querySelector(".plot-tip");
  if (!tip) {
    tip = document.createElement("div");
    tip.className = "plot-tip";
    host.appendChild(tip);
  }
  if (canvas._plotBound) return;
  canvas._plotBound = true;
  function applyAt(e) {
    if (!canvas._onSet) return;
    var at = plotPointer(canvas, e);
    if (!at) return;
    var plot = at.plot;
    if (at.mx < plot.pad.l || at.mx > plot.w - plot.pad.r) return;
    if (at.my < plot.pad.t || at.my > plot.h - plot.pad.b) return;
    var near = nearestPlotCol(plot, at.mx);
    if (!near) return;
    canvas._onSet(near.cell.c, at.yVal, plot.scale.digits);
  }
  canvas.onmousemove = function (e) {
    if (canvas._drag) {
      tip.style.display = "none";
      applyAt(e);
      return;
    }
    var plot = canvas._plot;
    if (!plot || !plot.hit.length) return;
    var at = plotPointer(canvas, e);
    if (!at) return;
    var best = null, bestD = 18;
    for (var i = 0; i < plot.hit.length; i++) {
      var p = plot.hit[i];
      var d = Math.hypot(p.x - at.mx, p.y - at.my);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    if (!best) {
      tip.style.display = "none";
      return;
    }
    tip.style.display = "block";
    var who = best.tag === "green" ? "CTP  " : "\u0432\u044c\u044e\u0435\u0440  ";
    tip.textContent =
      who + fmtTick(best.xv, plot.xAx.digits) + " \u2192 " + fmtPoint(best.v, plot.scale.digits) +
      "   raw " + best.raw;
    var left = (best.x / plot.w) * at.rect.width + 12;
    var top = (best.y / plot.h) * at.rect.height - 10;
    tip.style.left = Math.min(left, at.rect.width - 140) + "px";
    tip.style.top = Math.max(0, top) + "px";
  };
  canvas.onmousedown = function (e) {
    if (!canvas._onSet || e.button !== 0) return;
    canvas._drag = true;
    applyAt(e);
    e.preventDefault();
  };
  window.addEventListener("mousemove", function (e) {
    if (canvas._drag) applyAt(e);
  });
  window.addEventListener("mouseup", function () {
    if (canvas._drag && canvas._onDragEnd) canvas._onDragEnd();
    canvas._drag = false;
  });
  canvas.onmouseleave = function () {
    if (!canvas._drag) tip.style.display = "none";
  };
}
