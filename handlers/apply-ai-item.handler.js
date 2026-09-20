function writeTableRawList(item, values) {
  if (!item || !values || !values.length) return 0;
  var w = item.width === 2 ? 2 : 1;
  var n = 0, i;
  for (i = 0; i < values.length; i++) {
    if (values[i] == null || !isFinite(Number(values[i]))) continue;
    if (writeRawBytes(state.bin, item.addr + i * w, Number(values[i]), w)) n++;
  }
  if (n) markBinDirty();
  return n;
}

function applyAiPatch(patch) {
  var item = findAiMapItem(patch);
  if (!item) return 0;
  if (item.kind === "flag") {
    var on = patch.value != null ? !!patch.value : !!(patch.raw != null ? patch.raw : patch.raw_value);
    return writeFlag(item, on) != null ? 1 : 0;
  }
  var map = patch.map || {};
  var phys = map.values_phys || patch.values_phys || patch.values;
  var raw = map.values_raw || patch.raw_values;
  if (item.kind === "table") {
    if (phys && phys.length) {
      var ids = phys.map(function (_, i) { return i; });
      return writeTableRange(item, ids, phys);
    }
    if (raw && raw.length) return writeTableRawList(item, raw);
    return 0;
  }
  if (patch.value != null && isFinite(Number(patch.value))) {
    return writeScalar(item, Number(patch.value)) != null ? 1 : 0;
  }
  var rv = patch.raw != null ? patch.raw : patch.raw_value;
  if (rv == null || !isFinite(Number(rv))) return 0;
  var w = item.width === 2 ? 2 : 1;
  if (!writeRawBytes(state.bin, item.addr, Number(rv), w)) return 0;
  markBinDirty();
  return 1;
}
