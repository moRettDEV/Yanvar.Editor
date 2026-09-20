function isBitsFolder(n) {
  return !!(n && n.kind === "folder" && n.children && n.children.length &&
    n.children.every(function (c) { return c.kind === "flag" || c.kind === "label"; }));
}

function isLeafFolder(n) {
  return isBitsFolder(n) || !!(typeof folderPinHost === "function" && folderPinHost(n));
}

function folderStats(n) {
  var total = 0, dirty = 0;
  function walk(list) {
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      var x = list[i];
      if (x.kind === "folder") {
        if (!isBitsFolder(x)) walk(x.children);
      } else if (x.kind !== "label") {
        total++;
        if (typeof isItemDirty === "function" && isItemDirty(x)) dirty++;
      }
    }
  }
  walk(n.children);
  return { total: total, ok: dirty };
}

function isMap3(n) {
  if (!n || n.kind !== "table") return false;
  if (n.rows >= 2 && n.cols >= 2) return true;
  return !!(n.axisLinks && n.axisLinks.length >= 2);
}

function iconFor(n) {
  var s = document.createElement("span");
  s.className = "ic ic-" + (
    isLeafFolder(n) || n.kind === "flag" || n.kind === "pin" ? "flag" :
    n.kind === "folder" ? "folder" :
    n.kind === "table" ? (isMap3(n) ? "map3" : "map") :
    "val"
  );
  s.setAttribute("aria-hidden", "true");
  return s;
}

function folderOpen(path) {
  return !!(state.open && state.open[path]);
}

function setFolderOpen(path, on) {
  state.open = state.open || {};
  if (on) state.open[path] = 1;
  else delete state.open[path];
}

function treePathOf(node, nodes, prefix) {
  if (!node || !nodes) return "";
  prefix = prefix || "";
  var i, n, p, hit;
  for (i = 0; i < nodes.length; i++) {
    n = nodes[i];
    p = prefix + "/" + n.name;
    if (n === node) return p;
    if (n.children) {
      hit = treePathOf(node, n.children, p);
      if (hit) return hit;
    }
  }
  return "";
}

function openTreePath(path, includeSelf) {
  var parts = (path || "").split("/").filter(Boolean);
  var acc = "";
  var last = includeSelf ? parts.length : parts.length - 1;
  var i;
  for (i = 0; i < last; i++) {
    acc += "/" + parts[i];
    setFolderOpen(acc, true);
  }
}

function toggleFolder(path) {
  setFolderOpen(path, !folderOpen(path));
  if (typeof persistSession === "function") persistSession();
  refreshTree();
}

function nameHit(n, filter) {
  if (!filter) return true;
  return typeof nodeMatches === "function" ? nodeMatches(n, filter) : treeMatch(n, filter);
}

function renderTree(nodes, filter, selected, prefix, folderHit) {
  prefix = prefix || "";
  var ul = document.createElement("ul");
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    var hitHere = !filter || nameHit(n, filter);
    if (filter && !folderHit && !treeMatch(n, filter)) continue;
    if (state.compareOnly && typeof nodeOrChildDiff === "function" && !nodeOrChildDiff(n)) continue;
    var path = prefix + "/" + n.name;
    var bitsPage = isLeafFolder(n);
    var isDir = n.kind === "folder" && !bitsPage;
    var open = !isDir || !!filter || !!state.compareOnly || folderOpen(path);
    var dirty = !isDir && typeof isItemDirty === "function" && isItemDirty(n);
    var diff = typeof hasCompare === "function" && hasCompare() && (
      isDir ? folderDiffCount(n) : (typeof isItemDiff === "function" && isItemDiff(n) ? 1 : 0)
    );
    var li = document.createElement("li");
    li.className = isDir ? "folder" : "item";
    var row = document.createElement("span");
    var diffKind = diff
      ? (n.kind === "flag" || n.kind === "pin" || bitsPage ? " diff-flag" : (n.kind === "table" || isDir ? " diff-map" : " diff"))
      : "";
    row.className = "row" + (n === selected ? " on" : "") + (dirty ? " dirty" : "") + (diff ? " diff" : "") + diffKind;
    var tw = document.createElement("span");
    tw.className = "tw";
    tw.textContent = isDir ? (open ? "\u25bc" : "\u25ba") : "";
    row.appendChild(tw);
    row.appendChild(iconFor(n));
    var nm = document.createElement("span");
    nm.className = "nm";
    nm.textContent = n.name;
    row.appendChild(nm);
    if (isDir) {
      if (diff) {
        var badge = document.createElement("span");
        badge.className = "mark diff" + (bitsPage ? " flag" : " map");
        badge.textContent = String(diff);
        row.appendChild(badge);
      } else {
        var st = folderStats(n);
        if (st.ok) {
          var badge0 = document.createElement("span");
          badge0.className = "mark" + (st.ok === st.total ? " ok" : " part");
          badge0.textContent = st.ok;
          row.appendChild(badge0);
        }
      }
    } else if (diff) {
      var badge2 = document.createElement("span");
      badge2.className = "mark diff" + (n.kind === "flag" || n.kind === "pin" ? " flag" : (n.kind === "table" ? " map" : ""));
      badge2.textContent = "≠";
      row.appendChild(badge2);
    } else if (dirty) {
      var badge3 = document.createElement("span");
      badge3.className = "mark part";
      badge3.textContent = "изм";
      row.appendChild(badge3);
    }
    tw.onclick = (function (p) {
      return function (ev) {
        ev.stopPropagation();
        toggleFolder(p);
      };
    })(path);
    row.onclick = (function (node, p) {
      return function () {
        if (node.kind === "folder" && !isLeafFolder(node)) setFolderOpen(p, true);
        selectNode(node);
      };
    })(n, path);
    row.oncontextmenu = (function (node) {
      return function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof showItemMenu === "function") showItemMenu(e.clientX, e.clientY, node, { bin: state.bin });
      };
    })(n);
    li.appendChild(row);
    if (n.children && n.children.length && open) {
      var vis = filter ? n.children : n.children.filter(function (c) {
        return c.kind !== "flag" && c.kind !== "label";
      });
      if (vis.length || filter) li.appendChild(renderTree(vis, filter, selected, path, folderHit || hitHere));
    }
    ul.appendChild(li);
  }
  return ul;
}

function treeMatch(n, q) {
  if (typeof nodeMatches === "function") {
    if (nodeMatches(n, q)) return true;
  } else if ((n.name || "").toLowerCase().indexOf(q) !== -1) return true;
  if (!n.children) return false;
  for (var i = 0; i < n.children.length; i++) if (treeMatch(n.children[i], q)) return true;
  return false;
}
