function checkedRec(n) {
  if (!n || n.kind === "folder" || n.addr == null || typeof Corrections === "undefined") return null;
  return Corrections.find(n.name, "0x" + hexYX(n.addr).addr);
}

function isBitsFolder(n) {
  return !!(n && n.kind === "folder" && n.children && n.children.length &&
    n.children.every(function (c) { return c.kind === "flag" || c.kind === "label"; }));
}

function isLeafFolder(n) {
  return isBitsFolder(n) || !!(typeof folderPinHost === "function" && folderPinHost(n));
}

function folderStats(n) {
  var total = 0, ok = 0;
  function walk(list) {
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      var x = list[i];
      if (x.kind === "folder") {
        if (!isBitsFolder(x)) walk(x.children);
      } else if (x.kind !== "label") {
        total++;
        if (checkedRec(x)) ok++;
      }
    }
  }
  walk(n.children);
  return { total: total, ok: ok };
}

function iconFor(n) {
  var s = document.createElement("span");
  s.className = "ic ic-" + (
    isLeafFolder(n) || n.kind === "flag" || n.kind === "pin" ? "flag" :
    n.kind === "folder" ? "folder" :
    n.kind === "table" ? (n.rows >= 2 && n.cols >= 2 ? "map3" : "map") :
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

function renderTree(nodes, filter, selected, prefix) {
  prefix = prefix || "";
  var ul = document.createElement("ul");
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    if (filter && !treeMatch(n, filter)) continue;
    var path = prefix + "/" + n.name;
    var bitsPage = isLeafFolder(n);
    var isDir = n.kind === "folder" && !bitsPage;
    var open = !isDir || !!filter || folderOpen(path);
    var rec = checkedRec(n);
    var li = document.createElement("li");
    li.className = isDir ? "folder" : "item";
    var row = document.createElement("span");
    row.className = "row" + (n === selected ? " on" : "") + (rec ? " done" : "");
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
      var st = folderStats(n);
      if (st.total) {
        var badge = document.createElement("span");
        badge.className = "mark" + (st.ok === st.total ? " ok" : st.ok ? " part" : " none");
        badge.textContent = st.ok + "/" + st.total;
        row.appendChild(badge);
      }
    } else if (rec) {
      var badge2 = document.createElement("span");
      badge2.className = "mark ok";
      badge2.textContent = rec.source === "confirm" ? "ok" : "ok";
      badge2.title = rec.source === "confirm"
        ? "\u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e"
        : "\u0437\u0430\u043f\u0438\u0441\u0430\u043d\u043e";
      row.appendChild(badge2);
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
    li.appendChild(row);
    if (n.children && n.children.length && open) {
      var bitsOnly = n.children.every(function (c) {
        return c.kind === "flag" || c.kind === "label";
      });
      var vis = filter ? n.children : n.children.filter(function (c) {
        return c.kind !== "flag" && c.kind !== "label";
      });
      if ((!bitsOnly && vis.length) || filter) li.appendChild(renderTree(vis, filter, selected, path));
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
