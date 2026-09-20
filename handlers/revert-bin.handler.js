function revertBin() {
  if (!state.origBin) return false;
  state.bin = cloneU8(state.origBin);
  state.binDirty = false;
  markBinDirty();
  if (state.selected) selectNode(state.selected);
  else refreshTree();
  return true;
}
