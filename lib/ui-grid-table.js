function heatRange(values) {
  var zs = values.filter(function (v) { return v != null && isFinite(v); });
  if (!zs.length) return { lo: 0, hi: 1 };
  var lo = Math.min.apply(null, zs);
  var hi = Math.max.apply(null, zs);
  if (lo === hi) hi = lo + 1;
  return { lo: lo, hi: hi };
}

function paintHeatCell(td, v, lo, hi, digits, empty, label) {
  if (empty || v == null || !isFinite(v)) {
    td.style.background = "#16181f";
    td.style.color = "#c5c9d4";
    td.textContent = "";
    return;
  }
    td.style.background = heatColor(v, lo, hi);
    td.style.color = "#e8eaed";
  td.textContent = label != null && label !== "" ? String(label) : fmtPoint(v, digits);
}

function startCellEdit(td, overlay, idx, onChange, onBefore) {
  td.contentEditable = "plaintext-only";
  if (td.contentEditable !== "plaintext-only") td.contentEditable = "true";
  td.focus();
  var range = document.createRange();
  range.selectNodeContents(td);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  var before = overlay ? overlay[idx] : "";
  function stop() {
    td.contentEditable = "false";
    td.removeEventListener("blur", stop);
    var next = td.textContent.replace(/\n/g, "").trim();
    if (overlay) {
      if (next !== String(before || "") && onBefore) onBefore();
      overlay[idx] = next;
    }
    if (onChange) onChange(idx);
  }
  td.addEventListener("blur", stop);
  td.onkeydown = function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      td.blur();
    }
  };
}

function makeGridTable(bytes, rows, cols, item, onRow, activeRow, opts) {
  opts = opts || {};
  var pack = tableCells(bytes, rows, cols, item);
  var overlay = opts.values;
  var editable = !!opts.editable;
  var shown = [];
  var i;
  for (i = 0; i < pack.cells.length; i++) {
    shown.push(overlay ? cellNum(overlay[i]) : pack.cells[i].v);
  }
  var rng = heatRange(shown);
  var table = document.createElement("table");
  table.className = "grid " + (editable ? "grid-ctp" : "grid-view");
  var thead = document.createElement("thead");
  var hr = document.createElement("tr");
  hr.appendChild(document.createElement("th"));
  for (var c = 0; c < cols; c++) {
    var th = document.createElement("th");
    th.textContent = fmtTick(axisAt(pack.xAx, c, cols), pack.xAx.digits);
    th.setAttribute("data-c", String(c));
    hr.appendChild(th);
  }
  thead.appendChild(hr);
  table.appendChild(thead);
  var tb = document.createElement("tbody");
  for (var r = 0; r < rows; r++) {
    var tr = document.createElement("tr");
    if (r === activeRow) tr.className = editable ? "on-row ctp-row-on" : "on-row";
    var rh = document.createElement("th");
    rh.textContent = pack.yAx ? fmtTick(axisAt(pack.yAx, r, rows), pack.yAx.digits) : String(r);
    tr.appendChild(rh);
    for (var c2 = 0; c2 < cols; c2++) {
      i = r * cols + c2;
      var cell = pack.cells[i];
      var td = document.createElement("td");
      td.setAttribute("data-i", String(i));
      td.setAttribute("data-r", String(r));
      td.setAttribute("data-c", String(c2));
      var v = shown[i];
      var empty = overlay && (overlay[i] == null || overlay[i] === "");
      paintHeatCell(td, v, rng.lo, rng.hi, pack.scale.digits, empty, overlay ? overlay[i] : null);
      if (opts.canEdit && !opts.canEdit(i)) {
        td.classList.add("ghost");
        td.title = "за краем файла — в bin не пишется";
      } else {
        td.title = overlay ? "" : "raw " + cell.raw;
      }
      if (!editable && rows > 1 && onRow) {
        td.style.cursor = "pointer";
        td.onclick = (function (row) {
          return function () { onRow(row); };
        })(r);
      }
      tr.appendChild(td);
    }
    tb.appendChild(tr);
  }
  table.appendChild(tb);
  table.recolor = function () {
    var next = [];
    for (var k = 0; k < pack.cells.length; k++) {
      next.push(overlay ? cellNum(overlay[k]) : pack.cells[k].v);
    }
    var rr = heatRange(next);
    var focus = document.activeElement;
    var cells = table.querySelectorAll("td[data-i]");
    for (k = 0; k < cells.length; k++) {
      var node = cells[k];
      var idx = Number(node.getAttribute("data-i"));
      var empty2 = overlay && (overlay[idx] == null || overlay[idx] === "");
      if (node === focus && node.isContentEditable) {
        if (empty2) {
          node.style.background = "#16181f";
          node.style.color = "#c5c9d4";
        } else {
          node.style.background = heatColor(next[idx], rr.lo, rr.hi);
          node.style.color = "#e8eaed";
        }
        continue;
      }
      paintHeatCell(node, next[idx], rr.lo, rr.hi, pack.scale.digits, empty2, overlay ? overlay[idx] : null);
    }
  };
  if (editable) {
    attachGridSelect(table, {
      onSelect: opts.onSelect,
      onActivate: function (td) {
        var idx = Number(td.getAttribute("data-i"));
        if (opts.canEdit && !opts.canEdit(idx)) return;
        startCellEdit(td, overlay, idx, opts.onChange, opts.onBeforeChange);
      }
    });
  }
  return table;
}
