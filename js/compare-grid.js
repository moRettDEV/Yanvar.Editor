function compareGridPack(item, layout, all) {
  if (typeof hasCompare !== "function" || !hasCompare() || !item || !layout) return null;
  var entries = all || (state.map ? state.map.entries : [item]);
  var oth = tableBytes(state.compareBin, item, entries);
  var texts = physTextsFromBin(oth.bytes, layout.rows, layout.cols, item, state.compareBin);
  var n = layout.rows * layout.cols;
  var w = item.width === 2 ? 2 : 1;
  var vals = [];
  var diff = [];
  var i, k, a, same;
  for (i = 0; i < n; i++) {
    vals.push(typeof cellNum === "function" ? cellNum(texts[i]) : Number(texts[i]));
    a = item.addr + i * w;
    if (typeof bothFit === "function" && !bothFit(state.bin, state.compareBin, a, w)) {
      diff.push(false);
      continue;
    }
    same = true;
    for (k = 0; k < w; k++) {
      if (state.bin[a + k] !== state.compareBin[a + k]) same = false;
    }
    diff.push(!same);
  }
  return { vals: vals, diff: diff };
}
