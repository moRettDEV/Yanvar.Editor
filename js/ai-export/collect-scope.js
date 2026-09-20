function collectAiScope(opts) {
  opts = opts || {};
  var rows = walkExportRows(state.map && state.map.tree);
  var scope = opts.scope || "all";
  var keys = opts.keys || {};
  function keyed(list) {
    var any = list.some(function (r) { return !!keys[aiItemKey(r.item)]; });
    return any ? list.filter(function (r) { return !!keys[aiItemKey(r.item)]; }) : list;
  }
  if (scope === "maps") {
    return keyed(rows.filter(function (r) { return r.item.kind === "table"; }));
  }
  if (scope === "params") {
    return keyed(rows.filter(function (r) { return r.item.kind !== "table"; }));
  }
  if (scope === "addr") {
    var lo = parseAiHex(opts.addrFrom);
    var hi = parseAiHex(opts.addrTo);
    if (lo == null || hi == null) return [];
    if (hi < lo) { var t = lo; lo = hi; hi = t; }
    return rows.filter(function (r) {
      return r.item.addr != null && r.item.addr >= lo && r.item.addr <= hi;
    });
  }
  return rows;
}

function defaultAiPickedKeys() {
  var keys = {};
  var sel = state.selected;
  if (!sel || !state.map) return keys;
  if (sel.kind === "folder") {
    walkExportRows(sel.children, sel.name).forEach(function (r) {
      keys[aiItemKey(r.item)] = true;
    });
    return keys;
  }
  if (sel.kind !== "label") keys[aiItemKey(sel)] = true;
  return keys;
}
