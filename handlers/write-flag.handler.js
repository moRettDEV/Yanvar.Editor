function writeFlag(item, on) {
  if (!state.bin || !item || item.kind !== "flag" || item.addr == null) return null;
  if (item.addr < 0 || item.addr >= state.bin.length) return null;
  if (typeof setFlag !== "function") return null;
  setFlag(state.bin, item, !!on);
  markBinDirty();
  return flagOn(state.bin, item);
}

function toggleFlag(item) {
  if (!state.bin || !item || item.kind !== "flag") return null;
  return writeFlag(item, !flagOn(state.bin, item));
}
