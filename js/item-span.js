function itemByteSpan(item, all) {
  if (!item || item.addr == null) return 0;
  if (item.kind === "flag" || item.kind === "pin" || item.kind === "label") return 1;
  var live = typeof liveSpan === "function" && typeof state !== "undefined"
    ? liveSpan(state.bin, item.addr)
    : 0;
  if (item.kind === "table" && typeof tableBytes === "function") {
    var list = all || (typeof state !== "undefined" && state.map ? state.map.entries : [item]);
    var pack = tableBytes(state.bin || new Uint8Array(0), item, list);
    var n = pack && pack.size ? pack.size : (item.width === 2 ? 2 : 1);
    return live ? Math.min(n, live) : n;
  }
  var w = item.width === 2 ? 2 : 1;
  return live ? Math.min(w, live) : w;
}

function isItemDirty(item) {
  if (!state.bin || !state.origBin || !item || item.addr == null) return false;
  var n = itemByteSpan(item);
  var i, a = item.addr;
  for (i = 0; i < n && a + i < state.bin.length && a + i < state.origBin.length; i++) {
    if (state.bin[a + i] !== state.origBin[a + i]) return true;
  }
  return false;
}

function countDirtyBytes() {
  if (!state.bin || !state.origBin) return 0;
  var n = Math.min(state.bin.length, state.origBin.length);
  var c = 0, i;
  for (i = 0; i < n; i++) if (state.bin[i] !== state.origBin[i]) c++;
  if (state.bin.length !== state.origBin.length) c += Math.abs(state.bin.length - state.origBin.length);
  return c;
}
