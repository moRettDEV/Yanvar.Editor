function rainbowZ(t) {
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  var h = (1 - t) * 240;
  return "hsl(" + Math.round(h) + ",78%,54%)";
}

function shadeHex(t, lift, dim) {
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  var h = (1 - t) * 240;
  var s = dim ? 58 : 82;
  var l = (dim ? 32 : 44) + lift * 14;
  return "hsl(" + Math.round(h) + "," + s + "%," + Math.round(l) + "%)";
}

function drawCtp3d(canvas, bytes, rows, cols, item, opts) {
  opts = opts || {};
  var pack = tableCells(bytes, rows, cols, item);
  var scale = pack.scale;
  var active = opts.row == null ? 0 : opts.row;
  if (active < 0) active = 0;
  if (active >= rows) active = rows - 1;
  var zs = pack.cells.map(function (p) { return p.v; }).filter(isFinite);
  var cmpVals = opts.cmpVals || [];
  var ci;
  for (ci = 0; ci < cmpVals.length; ci++) {
    if (cmpVals[ci] != null && isFinite(cmpVals[ci])) zs.push(cmpVals[ci]);
  }
  var dLo = zs.length ? Math.min.apply(null, zs) : 0;
  var dHi = zs.length ? Math.max.apply(null, zs) : 1;
  var y0 = !scale.auto && scale.yMin != null ? scale.yMin : Math.min(0, dLo);
  var y1 = !scale.auto && scale.yMax != null ? scale.yMax : dHi + (dHi - dLo) * 0.06 + 0.05;
  if (cmpVals.length) {
    y0 = Math.min(y0, dLo);
    y1 = Math.max(y1, dHi + (dHi - dLo) * 0.06 + 0.05);
  }
  if (!(y1 > y0)) y1 = y0 + 1;
  var yt = niceTicks(y0, y1, 7, scale.yStep);
  var zSpan = yt.max - yt.min;
  var sz = canvasSize(canvas, 960, 560);
  var w = sz.w, h = sz.h;
  var pad = { l: 90, r: 48, t: 44, b: 56 };
  var ctx = fillCanvas(canvas, w, h);
  var boxW = w - pad.l - pad.r;
  var boxH = h - pad.t - pad.b;
  var yaw = opts.yaw == null ? 0.62 : opts.yaw;
  var pitch = opts.pitch == null ? 0.48 : opts.pitch;
  var zoom = opts.zoom == null ? 1 : opts.zoom;
  var ox = pad.l + boxW * 0.52 + (opts.panX || 0);
  var oy = pad.t + boxH * 0.56 + (opts.panY || 0);
  var sc = Math.min(boxW, boxH) * 0.74 * zoom;
  var zDig = scale.axisDigits != null ? scale.axisDigits : scale.digits;
  var xAx = pack.xAx;
  var yAx = pack.yAx;
  var xTicks = xAx && xAx.values && xAx.values.length === cols ? xAx.values : null;
  var yTicks = yAx && yAx.values && yAx.values.length === rows ? yAx.values : null;

  function rot3(c, r, z) {
    var u = cols <= 1 ? 0 : c / (cols - 1);
    var v = rows <= 1 ? 0 : r / (rows - 1);
    var t = (z - yt.min) / zSpan;
    var x = u - 0.5;
    var y = v - 0.5;
    var zz = (t - 0.5) * 0.4;
    var cy = Math.cos(yaw);
    var sy = Math.sin(yaw);
    var x1 = x * cy - y * sy;
    var y1 = x * sy + y * cy;
    var cp = Math.cos(pitch);
    var sp = Math.sin(pitch);
    return { x: x1, y: y1 * cp - zz * sp, z: y1 * sp + zz * cp };
  }

  function proj(c, r, z) {
    var p = rot3(c, r, z);
    var persp = 1 / (1 + p.y * 0.28);
    return { x: ox + p.x * sc * persp, y: oy - p.z * sc * persp };
  }

  function dotAt(p, r, fill) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, r == null ? 1.8 : r, 0, Math.PI * 2);
    ctx.fillStyle = fill || "rgba(236,240,248,0.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(8,10,16,0.5)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  function line(a, b, col, width) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = col;
    ctx.lineWidth = width == null ? 1 : width;
    ctx.stroke();
  }

  ctx.fillStyle = "#12141a";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#e8eaed";
  ctx.font = "600 15px Segoe UI, Tahoma, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(item && item.name ? item.name : "", w / 2, 24);

  var i, r, c, a, b;
  for (i = 0; i < yt.ticks.length; i++) {
    a = proj(0, 0, yt.ticks[i]);
    b = proj(0, rows - 1, yt.ticks[i]);
    line(a, b, "rgba(180,190,210,0.16)", 1);
    line(a, proj(cols - 1, 0, yt.ticks[i]), "rgba(180,190,210,0.1)", 1);
  }
  for (c = 0; c < cols; c++) {
    line(proj(c, 0, yt.min), proj(c, rows - 1, yt.min), "rgba(180,190,210,0.22)", 1);
  }
  for (r = 0; r < rows; r++) {
    line(proj(0, r, yt.min), proj(cols - 1, r, yt.min), "rgba(180,190,210,0.22)", 1);
  }
  for (r = 0; r < rows; r++) {
    for (c = 0; c < cols; c++) {
      dotAt(proj(c, r, yt.min), 1.5, "rgba(200,210,230,0.85)");
    }
  }

  line(proj(0, 0, yt.min), proj(cols - 1, 0, yt.min), "rgba(220,226,238,0.45)", 1.2);
  line(proj(0, 0, yt.min), proj(0, rows - 1, yt.min), "rgba(220,226,238,0.45)", 1.2);
  line(proj(0, 0, yt.min), proj(0, 0, yt.max), "rgba(220,226,238,0.55)", 1.3);
  line(proj(0, 0, yt.max), proj(cols - 1, 0, yt.max), "rgba(220,226,238,0.22)", 1);
  line(proj(cols - 1, 0, yt.min), proj(cols - 1, 0, yt.max), "rgba(220,226,238,0.2)", 1);
  line(proj(0, rows - 1, yt.min), proj(cols - 1, rows - 1, yt.min), "rgba(220,226,238,0.18)", 1);

  var quads = [];
  var z00, z10, z01, z11, avg, lift;
  for (r = 0; r < rows - 1; r++) {
    for (c = 0; c < cols - 1; c++) {
      z00 = pack.cells[r * cols + c].v;
      z10 = pack.cells[r * cols + c + 1].v;
      z01 = pack.cells[(r + 1) * cols + c].v;
      z11 = pack.cells[(r + 1) * cols + c + 1].v;
      avg = (z00 + z10 + z01 + z11) / 4;
      lift = ((z10 - z00) + (z01 - z00)) / (zSpan || 1);
      quads.push({ r: r, c: c, avg: avg, lift: lift, z00: z00, z10: z10, z01: z01, z11: z11 });
    }
  }
  quads.sort(function (p, q) {
    return rot3(q.c + 0.5, q.r + 0.5, q.avg).y - rot3(p.c + 0.5, p.r + 0.5, p.avg).y;
  });

  for (i = 0; i < quads.length; i++) {
    var q = quads[i];
    var on = q.r === active || q.r + 1 === active;
    ctx.beginPath();
    a = proj(q.c, q.r, q.z00);
    ctx.moveTo(a.x, a.y);
    a = proj(q.c + 1, q.r, q.z10);
    ctx.lineTo(a.x, a.y);
    a = proj(q.c + 1, q.r + 1, q.z11);
    ctx.lineTo(a.x, a.y);
    a = proj(q.c, q.r + 1, q.z01);
    ctx.lineTo(a.x, a.y);
    ctx.closePath();
    ctx.fillStyle = shadeHex((q.avg - yt.min) / zSpan, q.lift, !on);
    ctx.fill();
    ctx.strokeStyle = on ? "rgba(255,255,255,0.55)" : "rgba(12,16,22,0.7)";
    ctx.lineWidth = on ? 1.15 : 1;
    ctx.stroke();
  }

  for (r = 0; r < rows; r++) {
    for (c = 0; c < cols; c++) {
      line(proj(c, r, pack.cells[r * cols + c].v), proj(c, r, yt.min), "rgba(190,200,220,0.2)", 0.8);
    }
  }
  for (c = 0; c < cols; c++) {
    ctx.beginPath();
    for (r = 0; r < rows; r++) {
      a = proj(c, r, pack.cells[r * cols + c].v);
      if (r === 0) ctx.moveTo(a.x, a.y);
      else ctx.lineTo(a.x, a.y);
    }
    ctx.strokeStyle = "rgba(8,10,14,0.75)";
    ctx.lineWidth = 1.05;
    ctx.stroke();
  }
  for (r = 0; r < rows; r++) {
    ctx.beginPath();
    for (c = 0; c < cols; c++) {
      a = proj(c, r, pack.cells[r * cols + c].v);
      if (c === 0) ctx.moveTo(a.x, a.y);
      else ctx.lineTo(a.x, a.y);
    }
    ctx.strokeStyle = r === active ? "#ffffff" : "rgba(8,10,14,0.75)";
    ctx.lineWidth = r === active ? 2.5 : 1.05;
    ctx.stroke();
  }

  for (r = 0; r < rows; r++) {
    for (c = 0; c < cols; c++) {
      a = proj(c, r, pack.cells[r * cols + c].v);
      ctx.beginPath();
      ctx.arc(a.x, a.y, r === active ? 3 : 1.7, 0, Math.PI * 2);
      ctx.fillStyle = r === active ? "#ffffff" : "rgba(236,240,248,0.85)";
      ctx.fill();
      ctx.strokeStyle = "rgba(8,10,16,0.55)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  ctx.fillStyle = "#c5c9d4";
  ctx.font = (cols > 20 || rows > 16 ? "9px" : "11px") + " Segoe UI, Tahoma, sans-serif";
  for (i = 0; i < yt.ticks.length; i++) {
    a = proj(0, 0, yt.ticks[i]);
    dotAt(a, 2, "#d7dde8");
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#c5c9d4";
    ctx.fillText(fmtTick(yt.ticks[i], zDig), a.x - 8, a.y);
  }
  for (c = 0; c < cols; c++) {
    a = proj(c, 0, yt.min);
    dotAt(a, 2, "#d7dde8");
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#c5c9d4";
    ctx.fillText(fmtTick(xTicks ? xTicks[c] : (xAx ? axisAt(xAx, c, cols) : c), xAx ? xAx.digits : 0), a.x, a.y + 8);
  }
  for (r = 0; r < rows; r++) {
    a = proj(0, r, yt.min);
    dotAt(a, r === active ? 2.4 : 2, r === active ? "#ffffff" : "#d7dde8");
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = r === active ? "#ffffff" : "#9aa0ad";
    ctx.fillText(fmtTick(yTicks ? yTicks[r] : (yAx ? axisAt(yAx, r, rows) : r), yAx ? yAx.digits : 0), a.x - 8, a.y);
  }

  ctx.save();
  ctx.translate(16, pad.t + boxH * 0.45);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "12px Segoe UI, Tahoma, sans-serif";
  ctx.fillStyle = "#9aa0ad";
  ctx.fillText(scale.yLabel || "", 0, 0);
  ctx.restore();
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(xAx && xAx.label ? xAx.label : "", pad.l + boxW * 0.5, h - 8);
  a = proj(0, Math.max(1, rows - 1), yt.min);
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(yAx && yAx.label ? yAx.label : (item.layout && item.layout.yName ? item.layout.yName : ""), a.x + 6, a.y - 4);

  var barX = w - 28;
  var barY = pad.t + 4;
  var barH = Math.min(boxH * 0.55, 180);
  for (i = 0; i < 36; i++) {
    ctx.fillStyle = rainbowZ(1 - i / 35);
    ctx.fillRect(barX, barY + (barH * i) / 36, 7, barH / 36 + 0.4);
  }
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.strokeRect(barX, barY, 7, barH);
  ctx.fillStyle = "#9aa0ad";
  ctx.textAlign = "right";
  ctx.font = "10px Segoe UI, Tahoma, sans-serif";
  ctx.fillText(fmtTick(yt.max, scale.digits), barX - 4, barY + 3);
  ctx.fillText(fmtTick(yt.min, scale.digits), barX - 4, barY + barH);

  if (typeof drawCtp3dOverlay === "function") {
    drawCtp3dOverlay(ctx, proj, rows, cols, pack, opts, active);
  }

  canvas._plot = null;
}

function drawSurface(canvas, bytes, rows, cols, item) {
  drawCtp3d(canvas, bytes, rows, cols, item, { row: 0 });
}
