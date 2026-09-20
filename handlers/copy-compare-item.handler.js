function copyCompareItem(item) {
  if (typeof hasCompare !== "function" || !hasCompare() || !item || item.addr == null) return 0;
  if (item.kind === "flag" && typeof setFlag === "function") {
    var was = flagOn(state.bin, item);
    setFlag(state.bin, item, flagOn(state.compareBin, item));
    if (flagOn(state.bin, item) === was) return 0;
    markBinDirty();
    return 1;
  }
  if (item.kind === "pin") {
    var raw = readRaw(state.compareBin, item);
    if (raw == null) return 0;
    if (readRaw(state.bin, item) === raw) return 0;
    if (!writeRawBytes(state.bin, item.addr, raw, item.width === 2 ? 2 : 1)) return 0;
    markBinDirty();
    return 1;
  }
  var n = typeof itemByteSpan === "function" ? itemByteSpan(item) : 1;
  var i, a = item.addr, c = 0;
  for (i = 0; i < n; i++) {
    if (a + i >= state.bin.length || a + i >= state.compareBin.length) break;
    if (state.bin[a + i] !== state.compareBin[a + i]) {
      state.bin[a + i] = state.compareBin[a + i];
      c++;
    }
  }
  if (c) markBinDirty();
  return c;
}
