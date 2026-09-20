function matchBundledMap(family, det) {
  if (!family || !det || !det.id || typeof MAP_CATALOG === "undefined") return null;
  var list = [];
  var i, m;
  for (i = 0; i < MAP_CATALOG.length; i++) {
    m = MAP_CATALOG[i];
    if (m.family === family && m.ids.indexOf(det.id) !== -1) list.push(m);
  }
  if (!list.length) return null;
  for (i = 0; i < list.length; i++) {
    if (/i\.(j5|j7)$/i.test(list[i].file)) return list[i];
  }
  return list[0];
}

function familyLabel(id) {
  if (id === "ls") return "LS";
  if (id === "stock") return "Сток";
  return "TRS";
}
