function copyCompareCells(item, ids) {
  if (typeof hasCompare !== "function" || !hasCompare() || !item || item.kind !== "table") return 0;
  if (!ids || !ids.length) return copyCompareItem(item);
  if (typeof applyMafCalib === "function") applyMafCalib(item);
  var w = item.width === 2 ? 2 : 1;
  var i, idx, o, k, c = 0, addr;
  for (i = 0; i < ids.length; i++) {
    idx = ids[i] | 0;
    if (idx < 0) continue;
    o = idx * w;
    for (k = 0; k < w; k++) {
      addr = item.addr + o + k;
      if (typeof bothFit === "function" && !bothFit(state.bin, state.compareBin, addr, 1)) continue;
      if (addr < 0 || addr >= state.bin.length || addr >= state.compareBin.length) continue;
      if (state.bin[addr] !== state.compareBin[addr]) {
        state.bin[addr] = state.compareBin[addr];
        c++;
      }
    }
  }
  if (c) markBinDirty();
  return c;
}
