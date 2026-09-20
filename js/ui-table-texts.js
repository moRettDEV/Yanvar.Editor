function physTextsFromBin(bytes, rows, cols, item, bin) {
  var pack = tableCells(bytes, rows, cols, item);
  var src = bin || (typeof state !== "undefined" ? state.bin : null);
  var w = item && item.width === 2 ? 2 : 1;
  var live = item && item.addr != null && src ? liveSpan(src, item.addr) : (bytes ? bytes.length : 0);
  var out = [];
  var i, v;
  for (i = 0; i < pack.cells.length; i++) {
    if (i * w >= live) {
      out.push("");
      continue;
    }
    v = pack.cells[i].v;
    out.push(v == null || !isFinite(v) ? "" : String(Math.round(v * 1000) / 1000));
  }
  return out;
}

function copyTableSpan(item) {
  var n = typeof itemByteSpan === "function" ? itemByteSpan(item) : 0;
  if (!n || !state.bin || item.addr == null) return new Uint8Array(0);
  var a = item.addr;
  var out = new Uint8Array(n);
  var i;
  for (i = 0; i < n && a + i < state.bin.length; i++) out[i] = state.bin[a + i];
  return out.subarray(0, i);
}

function restoreTableSpan(item, snap) {
  if (!snap || !state.bin || item.addr == null) return;
  var i, a = item.addr;
  var n = typeof itemByteSpan === "function" ? itemByteSpan(item) : snap.length;
  if (n > snap.length) n = snap.length;
  for (i = 0; i < n && a + i < state.bin.length; i++) state.bin[a + i] = snap[i];
  markBinDirty();
}
