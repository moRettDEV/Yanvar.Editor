function renderTable(item, bin, all) {
  var pack = tableBytes(bin, item, all);
  var hx = hexYX(item.addr);
  var addr = "0x" + hx.addr;
  var saved = typeof Corrections !== "undefined" ? Corrections.find(item.name, addr) : null;
  var layout = layoutFromRec(saved, pack.size, item, bin);
  if (item.rows >= 2 && item.cols >= 2) {
    layout.rows = item.rows;
    layout.cols = item.cols;
  }
  applyTableLayout(item, layout);
  var activeRow = 0;
  var cellN = layout.rows * layout.cols;
  if (!cellN) cellN = item.width === 2 ? Math.floor(pack.size / 2) : pack.size;
  var ctpText = ctpTextFromRec(saved, cellN);
  if (typeof fillMafCteText === "function") fillMafCteText(item, ctpText);
  layout.ctpText = ctpText;
  var knownZ = typeof knownTableZ === "function" ? knownTableZ(item) : null;
  var inferred = (knownZ || (typeof isMafCalib === "function" && isMafCalib(item)))
    ? null
    : inferZFromCells(filledCellPairs(pack.bytes, ctpText));
  if (inferred && inferred !== "raw") layout.z = inferred;
  if (!layout.z || layout.z === "auto" || layout.z === "raw") {
    if (knownZ) layout.z = knownZ;
  }
  if (typeof lockKnownTableZ === "function") lockKnownTableZ(item, layout);

  var wrap = document.createElement("div");
  wrap.className = "ctp-page";
  var h2 = document.createElement("h2");
  h2.className = "ctp-map-title";
  var zLab = typeof mapZLabel === "function" ? mapZLabel(item) : (item.zUnit || "");
  h2.textContent = item.name + (zLab ? ", " + zLab : "");
  var meta = document.createElement("p");
  meta.className = "hint";
  var rowBar = document.createElement("div");
  rowBar.className = "axis-slider";
  var rowLab = document.createElement("span");
  rowLab.className = "axis-slider-name";
  var rowRange = document.createElement("input");
  rowRange.type = "range";
  rowRange.min = "0";
  rowRange.step = "1";
  var rowVal = document.createElement("span");
  rowVal.className = "axis-slider-val";
  var view3d = !!(typeof state !== "undefined" && state.view3d);
  var orbit = { yaw: 0.62, pitch: 0.48, zoom: 1, panX: 0, panY: 0 };
  var modeLab = document.createElement("label");
  modeLab.className = "axis-3d";
  var modeBox = document.createElement("input");
  modeBox.type = "checkbox";
  modeBox.checked = view3d;
  modeLab.appendChild(modeBox);
  modeLab.appendChild(document.createTextNode("3D"));
  var orbitHint = document.createElement("span");
  orbitHint.className = "axis-3d-hint";
  orbitHint.textContent = "\u041b\u041a\u041c \u043a\u0440\u0443\u0442\u0438\u0442\u044c \u00b7 \u0421\u041a\u041c \u0434\u0432\u0438\u0433\u0430\u0442\u044c \u00b7 \u043a\u043e\u043b\u0435\u0441\u043e \u043c\u0430\u0441\u0448\u0442\u0430\u0431";
  rowBar.appendChild(rowLab);
  rowBar.appendChild(rowRange);
  rowBar.appendChild(rowVal);
  rowBar.appendChild(modeLab);
  rowBar.appendChild(orbitHint);
  var host = document.createElement("div");
  host.id = "gridwrap";
  host.className = "plot-host";
  var c1 = document.createElement("canvas");
  c1.className = "chart";
  var viewCap = document.createElement("div");
  viewCap.className = "table-cap view";
  viewCap.textContent = "\u0421\u0438\u043d\u044f\u044f \u2014 \u0432\u044c\u044e\u0435\u0440";
  var viewHost = document.createElement("div");
  viewHost.className = "table-nums";
  var editCap = document.createElement("div");
  editCap.className = "table-cap ctp";
  editCap.textContent = "\u0417\u0435\u043b\u0451\u043d\u0430\u044f \u2014 Shift \u0434\u0438\u0430\u043f\u0430\u0437\u043e\u043d, Ctrl \u0442\u043e\u0447\u0435\u0447\u043d\u043e";
  var tools = makeCtpTools();
  var editHost = document.createElement("div");
  editHost.className = "table-nums";
  var fixBox;
  var saveTimer = null;
  var editKey = "";
  var hist = typeof createEditHistory === "function" ? createEditHistory(80) : null;
  var applyingHist = false;
  var plotBatch = false;

  function snapCells() {
    return ctpText.slice();
  }
  function remember() {
    if (applyingHist || !hist) return;
    hist.push(snapCells());
  }
  function applySnap(arr) {
    if (!arr) return;
    applyingHist = true;
    ctpText.length = 0;
    var i;
    for (i = 0; i < arr.length; i++) ctpText.push(arr[i]);
    layout.ctpText = ctpText;
    onCtpInput();
    applyingHist = false;
  }

  function fillRowPick() {
    rowBar.style.display = layout.rows > 1 ? "grid" : "none";
    if (layout.rows <= 1) return;
    if (activeRow >= layout.rows) activeRow = 0;
    rowRange.max = String(layout.rows - 1);
    rowRange.value = String(activeRow);
    rowLab.textContent = layout.yName || item.unit || "Y";
    var ax = typeof resolveAxis === "function" ? resolveAxis("row", layout.rows, item) : null;
    var v = ax && typeof axisAt === "function" ? axisAt(ax, activeRow, layout.rows) : activeRow + 1;
    var dig = ax && ax.digits != null ? ax.digits : 0;
    rowVal.textContent = typeof fmtTick === "function" ? fmtTick(v, dig) : String(v);
  }

  function rebuildEdit() {
    var key = [layout.rows, layout.cols, layout.xName, layout.xFrom, layout.xTo, layout.xStep, layout.zName, layout.zFrom, layout.zTo, layout.zStep].join("|");
    var focus = document.activeElement;
    var idx = focus && focus.getAttribute && focus.getAttribute("data-i");
    editKey = key;
    ctpText = resizeCtpText(ctpText, layout.rows * layout.cols);
    layout.ctpText = ctpText;
    editHost.innerHTML = "";
    editHost.appendChild(makeEditGrid(pack.bytes, layout.rows, layout.cols, item, ctpText, onCtpInput, activeRow, function (ids) {
      tools.setSelCount(ids.length);
      var ends = interpEnds(ctpText, ids, layout.cols);
      if (ends) tools.setEnds(ends.v0, ends.v1);
    }, remember));
    if (idx != null) {
      var cell = editHost.querySelector('td[data-i="' + idx + '"]');
      if (cell) {
        cell.focus();
        var range = document.createRange();
        range.selectNodeContents(cell);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  function onCtpInput() {
    var knownZ = typeof knownTableZ === "function" ? knownTableZ(item) : null;
    var z = (knownZ || (typeof isMafCalib === "function" && isMafCalib(item)))
      ? null
      : inferZFromCells(filledCellPairs(pack.bytes, ctpText));
    if (z) {
      layout.z = z;
      if (fixBox && fixBox.setZ) fixBox.setZ(z);
    }
    if (typeof lockKnownTableZ === "function") lockKnownTableZ(item, layout);
    paint({ skipEdit: true });
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      if (fixBox && fixBox.persistQuiet) fixBox.persistQuiet();
    }, 900);
  }

  function onPlotSet(col, yVal, digits) {
    if (!plotBatch) {
      remember();
      plotBatch = true;
    }
    var i = activeRow * layout.cols + col;
    ctpText[i] = String(Math.round(yVal * 1000) / 1000);
    onCtpInput();
  }

  function paint(opts) {
    opts = opts || {};
    applyTableLayout(item, layout);
    ctpText = resizeCtpText(ctpText, layout.rows * layout.cols);
    layout.ctpText = ctpText;
    meta.textContent = "0x" + hx.addr + "  Y " + hx.y + " X " + hx.x + "  2D  " + layout.rows + "x" + layout.cols + "  " + pack.size + " \u0431\u0430\u0439\u0442";
    if (tools && tools.setAxis) tools.setAxis(layout.xName || item.unit || "");
    fillRowPick();
    modeLab.style.display = layout.rows > 1 ? "inline-flex" : "none";
    if (c1.parentNode !== host) {
      host.innerHTML = "";
      host.appendChild(c1);
    }
    orbitHint.classList.toggle("on", !!(view3d && layout.rows > 1));
    if (view3d && layout.rows > 1) {
      drawCtp3d(c1, pack.bytes, layout.rows, layout.cols, item, {
        row: activeRow,
        yaw: orbit.yaw,
        pitch: orbit.pitch,
        zoom: orbit.zoom,
        panX: orbit.panX || 0,
        panY: orbit.panY || 0
      });
      attachPlotHover(c1, null);
      if (typeof attachOrbit3d === "function") {
        attachOrbit3d(c1, orbit, function (next) {
          orbit = next;
          paint({ skipEdit: true, skipView: true });
        });
      }
    } else {
      drawCtp2d(c1, pack.bytes, layout.rows, layout.cols, item, {
        row: activeRow,
        onlyActive: true,
        overlay: overlayRow(ctpText, activeRow, layout.cols),
        hideFlatBlue: typeof isMafCalib === "function" && isMafCalib(item),
        labelEvery: layout.cols > 32 ? Math.round((layout.cols - 1) / 15) : 0
      });
      attachPlotHover(c1, onPlotSet, function () { plotBatch = false; });
      if (c1._onOrbit !== undefined) {
        c1._onOrbit = null;
        c1.style.cursor = "";
      }
    }
    if (!opts.skipView) {
      viewHost.innerHTML = "";
      viewHost.appendChild(makeGridTable(pack.bytes, layout.rows, layout.cols, item, function (row) {
        activeRow = row;
        paint();
      }, activeRow));
    }
    if (!opts.skipEdit) rebuildEdit();
    else if (editHost.firstChild && editHost.firstChild.recolor) editHost.firstChild.recolor();
  }

  var lastPlotW = 0;
  function redrawPlot() {
    if (!wrap.isConnected) return;
    var w = host.clientWidth;
    if (!w || Math.abs(w - lastPlotW) < 2) return;
    lastPlotW = w;
    paint({ skipEdit: true, skipView: true });
  }
  if (window.ResizeObserver) {
    new ResizeObserver(redrawPlot).observe(host);
  } else {
    window.addEventListener("resize", function onWinResize() {
      if (!wrap.isConnected) {
        window.removeEventListener("resize", onWinResize);
        return;
      }
      lastPlotW = 0;
      redrawPlot();
    });
  }

  rowRange.oninput = function () {
    activeRow = Number(rowRange.value) || 0;
    paint();
  };
  modeBox.onchange = function () {
    view3d = modeBox.checked;
    if (typeof state !== "undefined") state.view3d = view3d;
    if (typeof persistSession === "function") persistSession();
    paint({ skipEdit: true, skipView: true });
  };
  fixBox = makeTableFix(item, bin, pack.bytes, layout, function (next) {
    layout = next;
    layout.ctpText = ctpText;
    paint();
  });
  function selectedIds() {
    var grid = editHost.querySelector("table");
    return grid && grid.getSelected ? grid.getSelected() : [];
  }

  function needSel() {
    var ids = selectedIds();
    if (ids.length) return ids;
    tools.note(false, "\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u0432\u044b\u0434\u0435\u043b\u0438 \u0441\u0442\u043e\u043b\u0431\u0446\u044b \u043d\u0430 \u0437\u0435\u043b\u0451\u043d\u043e\u0439 \u0442\u0430\u0431\u043b\u0438\u0446\u0435.");
    return null;
  }

  tools.onSet = function (text) {
    var ids = needSel();
    if (!ids) return;
    if (parseCtp(text) == null) {
      tools.note(false, "\u0412\u0432\u0435\u0434\u0438 \u0447\u0438\u0441\u043b\u043e.");
      return;
    }
    var i;
    remember();
    for (i = 0; i < ids.length; i++) ctpText[ids[i]] = String(text);
    onCtpInput();
    tools.note(true, "\u0423\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u043b \u0432 " + ids.length + " \u044f\u0447.");
  };
  tools.onDelta = function (text, pct) {
    var ids = needSel();
    if (!ids) return;
    var d = parseCtp(text);
    if (d == null) {
      tools.note(false, "\u0412\u0432\u0435\u0434\u0438 \u0447\u0438\u0441\u043b\u043e.");
      return;
    }
    var cells = tableCells(pack.bytes, layout.rows, layout.cols, item).cells;
    var i;
    remember();
    for (i = 0; i < ids.length; i++) {
      var base = cellNum(ctpText[ids[i]]);
      if (base == null && cells[ids[i]]) base = cells[ids[i]].v;
      if (base == null) continue;
      var next = pct ? base * (1 + d / 100) : base + d;
      ctpText[ids[i]] = String(Math.round(next * 1000) / 1000);
    }
    onCtpInput();
    tools.note(true, pct ? ("\u0418\u0437\u043c\u0435\u043d\u0438\u043b \u043d\u0430 " + d + "%") : ("\u0418\u0437\u043c\u0435\u043d\u0438\u043b \u043d\u0430 " + d));
  };
  tools.onInterp = function (a, b) {
    var ids = needSel();
    if (!ids || ids.length < 2) {
      tools.note(false, "\u0412\u044b\u0434\u0435\u043b\u0438 \u0434\u0438\u0430\u043f\u0430\u0437\u043e\u043d: \u043d\u0430 \u043a\u0440\u0430\u044f\u0445 \u0443\u0436\u0435 \u0441\u0442\u043e\u044f\u0442 \u0447\u0438\u0441\u043b\u0430.");
      return;
    }
    remember();
    var n = interpCells(ctpText, ids, layout.cols, a, b);
    if (!n) {
      tools.note(false, "\u041d\u0430 \u043a\u0440\u0430\u044f\u0445 \u0432\u044b\u0434\u0435\u043b\u0435\u043d\u0438\u044f \u043d\u0443\u0436\u043d\u044b \u0447\u0438\u0441\u043b\u0430.");
      return;
    }
    var ends = interpEnds(ctpText, ids, layout.cols);
    if (ends) tools.setEnds(ends.v0, ends.v1);
    onCtpInput();
    tools.note(true, "\u0418\u043d\u0442\u0435\u0440\u043f\u043e\u043b\u044f\u0446\u0438\u044f: " + n + " \u044f\u0447.");
  };
  tools.setAxis((layout.xName || item.unit || "") + (item.zUnit ? ", " + item.zUnit : ""));

  wrap.appendChild(h2);
  wrap.appendChild(meta);
  wrap.appendChild(rowBar);
  wrap.appendChild(host);
  wrap.appendChild(viewCap);
  wrap.appendChild(viewHost);
  wrap.appendChild(editCap);
  wrap.appendChild(tools);
  wrap.appendChild(editHost);
  wrap.appendChild(fixBox);
  if (typeof attachCteMenu === "function") {
    var cteApi = { bin: bin, get ctpText() { return ctpText; }, get layout() { return layout; } };
    attachCteMenu(wrap, item, cteApi);
    attachCteMenu(host, item, cteApi);
    attachCteMenu(editHost, item, cteApi);
    attachCteMenu(viewHost, item, cteApi);
  }
  if (typeof EditUndo !== "undefined") {
    EditUndo.bind({
      undo: function () { applySnap(hist && hist.undo(snapCells())); },
      redo: function () { applySnap(hist && hist.redo(snapCells())); }
    });
  }
  paint();
  return wrap;
}
