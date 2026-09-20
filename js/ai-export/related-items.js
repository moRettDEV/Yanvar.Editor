function aiStorageType(item) {
  if (item.kind === "flag") return "bit";
  if (item.width === 2) return "u16";
  return "u8";
}

function aiRelatedNames(row) {
  var folder = row.folder;
  var names = [];
  var rows = walkExportRows(state.map && state.map.tree);
  var i, r;
  for (i = 0; i < rows.length; i++) {
    r = rows[i];
    if (r.item === row.item) continue;
    if (folder && r.folder === folder) names.push(r.item.name);
    if (names.length >= 12) break;
  }
  var links = row.item.axisLinks;
  if (links && links.length) {
    for (i = 0; i < links.length && names.length < 16; i++) {
      var a = links[i];
    var addr = typeof a === "number" ? a : a && a.addr;
    if (addr == null) continue;
    names.push("axis_ref:" + (typeof hexYX === "function" ? "0x" + hexYX(addr).addr : addr));
    }
  }
  return names;
}
