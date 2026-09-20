function hasCompare() {
  return !!(state.compareBin && state.bin && state.map);
}

function isItemDiff(item) {
  if (!hasCompare() || !item || item.addr == null) return false;
  if (item.kind === "flag" && typeof flagOn === "function") {
    return flagOn(state.bin, item) !== flagOn(state.compareBin, item);
  }
  if (item.kind === "pin" && typeof readRaw === "function") {
    return readRaw(state.bin, item) !== readRaw(state.compareBin, item);
  }
  var n = typeof itemByteSpan === "function" ? itemByteSpan(item) : 1;
  var a = item.addr;
  var i;
  var live = Math.min(n, liveSpan(state.bin, a), liveSpan(state.compareBin, a));
  if (live < 1) return false;
  for (i = 0; i < live; i++) {
    if (state.bin[a + i] !== state.compareBin[a + i]) return true;
  }
  return false;
}

function nodeOrChildDiff(n) {
  if (!n) return false;
  if (n.kind !== "folder") return isItemDiff(n);
  var list = n.children || [];
  var i;
  for (i = 0; i < list.length; i++) if (nodeOrChildDiff(list[i])) return true;
  return false;
}

function folderDiffCount(n) {
  var c = 0;
  function walk(list) {
    if (!list) return;
    var i, x;
    for (i = 0; i < list.length; i++) {
      x = list[i];
      if (x.kind === "folder") walk(x.children);
      else if (x.kind !== "label" && isItemDiff(x)) c++;
    }
  }
  walk(n && n.children);
  return c;
}

function countDiffItems(nodes) {
  var c = 0;
  function walk(list) {
    if (!list) return;
    var i, x;
    for (i = 0; i < list.length; i++) {
      x = list[i];
      if (x.kind === "folder") walk(x.children);
      else if (x.kind !== "label" && isItemDiff(x)) c++;
    }
  }
  walk(nodes);
  return c;
}
