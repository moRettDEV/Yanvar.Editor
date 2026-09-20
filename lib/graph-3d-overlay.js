function stroke3dPolyline(ctx, proj, pts, color, width) {
  ctx.beginPath();
  var started = false;
  var i, a;
  for (i = 0; i < pts.length; i++) {
    if (!pts[i]) {
      started = false;
      continue;
    }
    a = proj(pts[i].c, pts[i].r, pts[i].z);
    if (!started) {
      ctx.moveTo(a.x, a.y);
      started = true;
    } else ctx.lineTo(a.x, a.y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawCtp3dCompareMesh(ctx, proj, rows, cols, cmpVals) {
  if (!cmpVals || !cmpVals.length) return;
  var r, c, pts, z;
  for (c = 0; c < cols; c++) {
    pts = [];
    for (r = 0; r < rows; r++) {
      z = cmpVals[r * cols + c];
      pts.push(z == null || !isFinite(z) ? null : { c: c, r: r, z: z });
    }
    stroke3dPolyline(ctx, proj, pts, "rgba(45,212,191,0.78)", 1.55);
  }
  for (r = 0; r < rows; r++) {
    pts = [];
    for (c = 0; c < cols; c++) {
      z = cmpVals[r * cols + c];
      pts.push(z == null || !isFinite(z) ? null : { c: c, r: r, z: z });
    }
    stroke3dPolyline(ctx, proj, pts, "rgba(45,212,191,0.78)", 1.55);
  }
}

function drawCtp3dDiffMarks(ctx, proj, rows, cols, pack, diffMask, active) {
  if (!diffMask || !diffMask.length) return;
  var r, c, i, a, z;
  for (r = 0; r < rows; r++) {
    for (c = 0; c < cols; c++) {
      i = r * cols + c;
      if (!diffMask[i] || !pack.cells[i]) continue;
      z = pack.cells[i].v;
      if (!isFinite(z)) continue;
      a = proj(c, r, z);
      ctx.beginPath();
      ctx.arc(a.x, a.y, r === active ? 5.6 : 4.3, 0, Math.PI * 2);
      ctx.strokeStyle = "#fb7185";
      ctx.lineWidth = r === active ? 2.4 : 1.9;
      ctx.stroke();
    }
  }
}

function drawCtp3dOverlay(ctx, proj, rows, cols, pack, opts, active) {
  opts = opts || {};
  drawCtp3dCompareMesh(ctx, proj, rows, cols, opts.cmpVals || []);
  drawCtp3dDiffMarks(ctx, proj, rows, cols, pack, opts.diffMask || [], active);
}
