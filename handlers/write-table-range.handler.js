function writeTableRange(item, ids, values) {
  if (!item || !ids) return 0;
  var n = 0;
  var i;
  for (i = 0; i < ids.length; i++) {
    var v = values[ids[i]];
    if (v == null || !isFinite(v)) continue;
    if (writeTableCell(item, ids[i], v)) n++;
  }
  return n;
}
