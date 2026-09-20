function isFormField(n) {
  if (!n || !n.tagName) return false;
  var t = n.tagName;
  return t === "INPUT" || t === "TEXTAREA" || t === "SELECT" || t === "BUTTON"
    || n.isContentEditable;
}

function attachGridSelect(table, opts) {
  opts = opts || {};
  if (table._selBound) return table;
  table._selBound = true;
  table._sel = [];
  table._anchor = null;

  function tds() {
    return table.querySelectorAll("td[data-i]");
  }

  function unique(ids) {
    var seen = {};
    var out = [];
    for (var i = 0; i < ids.length; i++) {
      if (seen[ids[i]]) continue;
      seen[ids[i]] = 1;
      out.push(ids[i]);
    }
    return out;
  }

  function paintSel(list) {
    table._sel = unique(list);
    var set = {};
    var i;
    for (i = 0; i < table._sel.length; i++) set[table._sel[i]] = 1;
    var nodes = tds();
    var colOn = {};
    for (i = 0; i < nodes.length; i++) {
      var id = Number(nodes[i].getAttribute("data-i"));
      var on = !!set[id];
      nodes[i].classList.toggle("sel", on);
      if (on) colOn[nodes[i].getAttribute("data-c")] = 1;
    }
    var ths = table.querySelectorAll("th[data-c]");
    for (i = 0; i < ths.length; i++) {
      ths[i].classList.toggle("sel", !!colOn[ths[i].getAttribute("data-c")]);
    }
    if (opts.onSelect) opts.onSelect(table._sel);
  }

  function idsInCols(c0, c1) {
    var ca = Math.min(c0, c1);
    var cb = Math.max(c0, c1);
    var out = [];
    var nodes = tds();
    for (var i = 0; i < nodes.length; i++) {
      var c = Number(nodes[i].getAttribute("data-c"));
      if (c >= ca && c <= cb) out.push(Number(nodes[i].getAttribute("data-i")));
    }
    return out;
  }

  function idsInRect(r0, c0, r1, c1) {
    var ra = Math.min(r0, r1);
    var rb = Math.max(r0, r1);
    var ca = Math.min(c0, c1);
    var cb = Math.max(c0, c1);
    var out = [];
    var nodes = tds();
    for (var i = 0; i < nodes.length; i++) {
      var r = Number(nodes[i].getAttribute("data-r"));
      var c = Number(nodes[i].getAttribute("data-c"));
      if (r >= ra && r <= rb && c >= ca && c <= cb) {
        out.push(Number(nodes[i].getAttribute("data-i")));
      }
    }
    return out;
  }

  function hitOf(node) {
    while (node && node !== table) {
      if (node.getAttribute) {
        if (node.getAttribute("data-i") != null) {
          return {
            kind: "cell",
            i: Number(node.getAttribute("data-i")),
            r: Number(node.getAttribute("data-r")),
            c: Number(node.getAttribute("data-c"))
          };
        }
        if (node.tagName === "TH" && node.getAttribute("data-c") != null) {
          return { kind: "col", i: null, r: 0, c: Number(node.getAttribute("data-c")) };
        }
      }
      node = node.parentNode;
    }
    return null;
  }

  function applyClick(cur, e) {
    if (e.shiftKey) {
      var a = table._anchor || cur;
      paintSel(a.kind === "col" || cur.kind === "col"
        ? idsInCols(a.c, cur.c)
        : idsInRect(a.r, a.c, cur.r, cur.c));
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      var one = cur.kind === "col" ? idsInCols(cur.c, cur.c) : [cur.i];
      var set = {};
      var i;
      for (i = 0; i < table._sel.length; i++) set[table._sel[i]] = 1;
      for (i = 0; i < one.length; i++) {
        if (set[one[i]]) delete set[one[i]];
        else set[one[i]] = 1;
      }
      var out = [];
      for (var k in set) {
        if (set.hasOwnProperty(k)) out.push(Number(k));
      }
      paintSel(out);
      table._anchor = cur;
      return;
    }
    table._anchor = cur;
    paintSel(cur.kind === "col" ? idsInCols(cur.c, cur.c) : [cur.i]);
  }

  table.addEventListener("mousedown", function (e) {
    if (e.button !== 0) return;
    if (isFormField(e.target)) return;
    var cur = hitOf(e.target);
    if (!cur) return;
    if (cur.kind === "col") e.preventDefault();
    applyClick(cur, e);
    if (cur.kind !== "col" || e.shiftKey || e.ctrlKey || e.metaKey) return;
    function move(ev) {
      var n = hitOf(ev.target);
      if (!n) {
        var el = document.elementFromPoint(ev.clientX, ev.clientY);
        n = hitOf(el);
      }
      if (n) paintSel(idsInCols(cur.c, n.c));
    }
    function up() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  });

  table.addEventListener("dblclick", function (e) {
    if (isFormField(e.target)) return;
    var cur = hitOf(e.target);
    if (!cur || cur.kind !== "cell" || !opts.onActivate) return;
    var td = e.target;
    while (td && td !== table) {
      if (td.getAttribute && td.getAttribute("data-i") != null) {
        opts.onActivate(td);
        return;
      }
      td = td.parentNode;
    }
  });

  table.getSelected = function () { return table._sel || []; };
  table.setSelected = paintSel;
  return table;
}
