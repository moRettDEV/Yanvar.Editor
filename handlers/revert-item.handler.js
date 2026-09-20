function revertItem(item) {
  if (!state.bin || !state.origBin || !item || item.addr == null) return false;
  var n = itemByteSpan(item);
  var i, a = item.addr;
  for (i = 0; i < n && a + i < state.bin.length && a + i < state.origBin.length; i++) {
    state.bin[a + i] = state.origBin[a + i];
  }
  markBinDirty();
  if (typeof selectNode === "function") selectNode(item);
  return true;
}
