function copyCompareFolder(node) {
  var n = 0;
  function walk(list) {
    if (!list) return;
    var i, x;
    for (i = 0; i < list.length; i++) {
      x = list[i];
      if (x.kind === "folder") walk(x.children);
      else if (x.kind !== "label" && copyCompareItem(x)) n++;
    }
  }
  if (!node) return 0;
  if (node.kind === "folder") walk(node.children);
  else if (copyCompareItem(node)) n = 1;
  return n;
}
