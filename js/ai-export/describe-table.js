function aiTableGeom(item, bin) {
  var entries = state.map ? state.map.entries : [item];
  var pack = typeof tableBytes === "function"
    ? tableBytes(bin, item, entries)
    : { bytes: new Uint8Array(0), size: 0 };
  var cols = item.cols || 16;
  var rows = item.rows && item.rows > 1 ? item.rows : 1;
  if ((!item.rows || item.rows <= 1) && pack.size && cols) {
    var w = item.width || 1;
    var n = Math.floor(pack.size / w);
    if (n > cols) rows = Math.max(1, Math.round(n / cols));
    else cols = Math.max(1, n);
  }
  return { pack: pack, rows: rows, cols: cols };
}

function aiAxisPack(ax, n) {
  if (!ax) return null;
  var values = [];
  var i;
  for (i = 0; i < n; i++) values.push(typeof axisAt === "function" ? axisAt(ax, i, n) : i);
  return {
    name: ax.label || ax.name || aiUnknown(),
    unit: ax.unit || null,
    values: values
  };
}

function describeAiTable(item, bin) {
  var g = aiTableGeom(item, bin);
  var cells = typeof tableCells === "function"
    ? tableCells(g.pack.bytes, g.rows, g.cols, item)
    : { cells: [] };
  var raw = [];
  var phys = [];
  var i, c;
  for (i = 0; i < cells.cells.length; i++) {
    c = cells.cells[i];
    raw.push(c.raw);
    phys.push(isFinite(c.v) ? c.v : null);
  }
  var scale = cells.scale || {};
  return {
    dimensions: g.cols + "x" + g.rows,
    cols: g.cols,
    rows: g.rows,
    x_axis: aiAxisPack(typeof axisX === "function" ? axisX(item, g.cols) : null, g.cols),
    y_axis: g.rows > 1 ? aiAxisPack(typeof axisY === "function" ? axisY(item, g.rows) : null, g.rows) : null,
    conversion: scale.yLabel ? String(scale.yLabel) : aiUnknown(),
    values_raw: raw,
    values_phys: phys
  };
}
