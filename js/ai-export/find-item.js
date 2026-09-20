function findAiMapItem(patch) {
  if (!patch || !state.map) return null;
  var addr = patch.address_int != null ? Number(patch.address_int) : parseAiHex(patch.address);
  var name = String(patch.name || "").trim();
  var bit = patch.bit;
  var rows = walkExportRows(state.map.tree);
  var i, item, best = null;
  for (i = 0; i < rows.length; i++) {
    item = rows[i].item;
    if (addr != null && item.addr !== addr) continue;
    if (addr == null && name && item.name !== name) continue;
    if (addr == null && !name) continue;
    if (item.kind === "flag" && bit != null && item.bit !== bit) continue;
    if (name && item.name === name) return item;
    if (!best) best = item;
  }
  return best;
}
