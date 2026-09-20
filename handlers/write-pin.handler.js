function setPin(item, raw) {
  if (!state.bin || !item || item.addr == null) return null;
  raw = raw | 0;
  if (raw < 0) raw = 0;
  if (raw > 255) raw = 255;
  if (!writeRawBytes(state.bin, item.addr, raw, 1)) return null;
  markBinDirty();
  return raw;
}
