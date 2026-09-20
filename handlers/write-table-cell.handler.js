function writeTableCell(item, index, phys) {
  if (!state.bin || !item || item.addr == null || index < 0) return false;
  if (typeof cellFits === "function" && !cellFits(state.bin, item, index)) return false;
  var w = item.width === 2 ? 2 : 1;
  var addr = item.addr + index * w;
  var raw = physToRaw(phys, item);
  if (raw == null) return false;
  var z = typeof knownTableZ === "function" ? knownTableZ(item) : null;
  var ok;
  if (z === "zone1") ok = writeMasked(state.bin, addr, raw, 1);
  else if (z === "zone3") ok = writeMasked(state.bin, addr, raw, 3);
  else if (z === "zone16") ok = writeMasked(state.bin, addr, raw, 16);
  else ok = writeRawBytes(state.bin, addr, raw, w);
  if (ok) markBinDirty();
  return ok;
}
