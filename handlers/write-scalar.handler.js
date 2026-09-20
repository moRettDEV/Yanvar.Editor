function writeScalar(item, phys) {
  if (!state.bin || !item || item.addr == null) return null;
  var raw = physToRaw(phys, item);
  if (raw == null) return null;
  if (!writeRawBytes(state.bin, item.addr, raw, item.width === 2 ? 2 : 1)) return null;
  markBinDirty();
  return raw;
}
