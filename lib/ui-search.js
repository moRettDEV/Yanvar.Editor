function normQ(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\u0451/g, "\u0435")
    .replace(/,/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

function haystack(n) {
  var parts = [n.name, n.unit, n.kind];
  if (n.addr != null) {
    var hx = hexYX(n.addr);
    parts.push(
      hx.addr,
      hx.y,
      hx.x,
      "0x" + hx.addr,
      n.addr.toString(16),
      String(n.addr)
    );
  }
  return normQ(parts.join(" "));
}

function nodeMatches(n, q) {
  if (!q) return true;
  var h = haystack(n);
  if (h.indexOf(q) !== -1) return true;
  var hex = q.replace(/^0x/, "");
  if (n.addr != null && hex) {
    var a = n.addr.toString(16);
    if (a.indexOf(hex) !== -1) return true;
    if (hexYX(n.addr).y.indexOf(hex) !== -1) return true;
  }
  return false;
}

function collectHits(nodes, q, out, folderHit) {
  out = out || [];
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    var here = !!(q && nodeMatches(n, q));
    if (n.kind !== "folder" && (here || folderHit)) out.push(n);
    if (n.children) collectHits(n.children, q, out, folderHit || (n.kind === "folder" && here));
  }
  return out;
}

function treeMatch(n, q) {
  if (nodeMatches(n, q)) return true;
  if (!n.children) return false;
  for (var i = 0; i < n.children.length; i++) if (treeMatch(n.children[i], q)) return true;
  return false;
}
