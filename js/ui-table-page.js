function renderTable(item, bin, all) {
  if (typeof isMafCalib === "function" && isMafCalib(item) && typeof ensureMafSpan === "function") {
    ensureMafSpan();
    bin = state.bin;
  }
  if (typeof applyMafCalib === "function") applyMafCalib(item);
  var pack = tableBytes(bin, item, all);
  var hx = hexYX(item.addr);
  var layoutSize = typeof isMafCalib === "function" && isMafCalib(item) ? 512 : pack.size;
  var layout = layoutFromRec(null, layoutSize, item, bin);
  if (typeof applyMafAxis === "function") applyMafAxis(layout, item);
  if (item.rows >= 2 && item.cols >= 2) {
    layout.rows = item.rows;
    layout.cols = item.cols;
  }
  applyTableLayout(item, layout);
  if (typeof lockKnownTableZ === "function") lockKnownTableZ(item, layout);

  var activeRow = 0;
  var wrap = document.createElement("div");
  wrap.className = "ctp-page";
  var h2 = document.createElement("h2");
  h2.className = "ctp-map-title";
  var zLab = typeof mapZLabel === "function" ? mapZLabel(item) : "";
  h2.textContent = item.name + (zLab ? ", " + zLab : "");
  var meta = document.createElement("p");
  meta.className = "hint";
  var rowBar = document.createElement("div");
  rowBar.className = "axis-slider";
  var rowLab = el("span", "axis-slider-name", "");
  var rowRange = document.createElement("input");
  rowRange.type = "range";
  rowRange.min = "0";
  rowRange.step = "1";
  var rowVal = el("span", "axis-slider-val", "");
  var view3d = !!state.view3d;
  var orbit = { yaw: 0.62, pitch: 0.48, zoom: 1, panX: 0, panY: 0 };
  var modeLab = el("label", "axis-3d", "");
  var modeBox = document.createElement("input");
  modeBox.type = "checkbox";
  modeBox.checked = view3d;
  modeLab.appendChild(modeBox);
  modeLab.appendChild(document.createTextNode("3D"));
  var orbitHint = el("span", "axis-3d-hint", "ЛКМ крутить · СКМ двигать · колесо масштаб");
  rowBar.appendChild(rowLab);
  rowBar.appendChild(rowRange);
  rowBar.appendChild(rowVal);
  rowBar.appendChild(modeLab);
  rowBar.appendChild(orbitHint);
  var host = document.createElement("div");
  host.className = "plot-host";
  var c1 = document.createElement("canvas");
  c1.className = "chart";
  var editCap = el("div", "table-cap",
    typeof isMafCalib === "function" && isMafCalib(item)
      ? "256 точек 0…5 В. Хвост за краем 64K дописывается в файл и сохраняется."
      : "Таблица — это bin. ПКМ: CTE. Shift — диапазон."
  );
  var tools = makeCtpTools();
  var editHost = document.createElement("div");
  editHost.className = "table-nums";
  var hist = createEditHistory(80);
  var applying = false;
  var plotBatch = false;

  function texts() {
    if (typeof mafDisplayTexts === "function") {
      return mafDisplayTexts(item, pack.bytes, layout, state.bin);
    }
    return physTextsFromBin(pack.bytes, layout.rows, layout.cols, item, state.bin);
  }

  function remember() {
    if (!applying) hist.push(copyTableSpan(item));
  }

  function applySnap(snap) {
    if (!snap) return;
    applying = true;
    restoreTableSpan(item, snap);
    pack = tableBytes(state.bin, item, all);
    paint();
    applying = false;
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
    rowVal.textContent = typeof fmtTick === "function" ? fmtTick(v, ax && ax.digits != null ? ax.digits : 0) : String(v);
  }

  function onCell(idx) {
    var grid = editHost.querySelector("table");
    var td = grid && grid.querySelector('td[data-i="' + idx + '"]');
    var v = parseCtp(td ? td.textContent : "");
    if (v == null) { paint(); return; }
    writeTableCell(item, idx, v);
    pack = tableBytes(state.bin, item, all);
    paint({ skipEdit: true });
    if (grid && grid.recolor) grid.recolor();
  }

  function rebuildEdit() {
    var ctpText = texts();
    editHost.innerHTML = "";
    editHost.appendChild(makeEditGrid(pack.bytes, layout.rows, layout.cols, item, ctpText, onCell, activeRow, function (ids) {
      tools.setSelCount(ids.length);
      var ends = interpEnds(ctpText, ids, layout.cols);
      if (ends) tools.setEnds(ends.v0, ends.v1);
    }, remember, { canEdit: function (i) { return mafCanEditCell(item, i); } }));
  }

  function paint(opts) {
    opts = opts || {};
    applyTableLayout(item, layout);
    if (typeof lockKnownTableZ === "function") lockKnownTableZ(item, layout);
    pack = tableBytes(state.bin, item, all);
    var ctpText = texts();
    meta.textContent = typeof mafMetaLine === "function"
      ? mafMetaLine(item, pack, layout, state.bin)
      : ("0x" + hx.addr + "  " + layout.rows + "×" + layout.cols + "  " + pack.size + " байт");
    if (tools.setAxis) tools.setAxis(layout.xName || item.unit || "");
    fillRowPick();
    modeLab.style.display = layout.rows > 1 ? "inline-flex" : "none";
    if (c1.parentNode !== host) {
      host.innerHTML = "";
      host.appendChild(c1);
    }
    if (typeof syncPlotLegend === "function") {
      syncPlotLegend(host, view3d && layout.rows > 1 ? "3d" : "2d");
    }
    orbitHint.classList.toggle("on", !!(view3d && layout.rows > 1));
    if (view3d && layout.rows > 1) {
      var cmpGrid = typeof compareGridPack === "function" ? compareGridPack(item, layout, all) : null;
      drawCtp3d(c1, pack.bytes, layout.rows, layout.cols, item, {
        row: activeRow, yaw: orbit.yaw, pitch: orbit.pitch, zoom: orbit.zoom,
        panX: orbit.panX || 0, panY: orbit.panY || 0,
        cmpVals: cmpGrid ? cmpGrid.vals : null,
        diffMask: cmpGrid ? cmpGrid.diff : null
      });
      attachPlotHover(c1, null);
      if (typeof attachOrbit3d === "function") {
        attachOrbit3d(c1, orbit, function (next) {
          orbit = next;
          paint({ skipEdit: true });
        });
      }
    } else {
      var cmpOverlay = typeof hasCompare === "function" && hasCompare() && typeof comparePlotOverlay === "function"
        ? comparePlotOverlay(item, layout, activeRow, all)
        : [];
      var plotOpts = typeof mafGraphOpts === "function"
        ? mafGraphOpts(item, layout, ctpText, cmpOverlay)
        : { overlay: cmpOverlay, hideFlatBlue: typeof isMafCalib === "function" && isMafCalib(item) };
      drawCtp2d(c1, pack.bytes, layout.rows, layout.cols, item, {
        row: activeRow,
        onlyActive: true,
        overlay: plotOpts.overlay,
        hideFlatBlue: plotOpts.hideFlatBlue,
        keepOverlay: plotOpts.keepOverlay,
        labelEvery: layout.cols > 32 ? Math.round((layout.cols - 1) / 15) : 0
      });
      attachPlotHover(c1, function (col, yVal) {
        var idx = activeRow * layout.cols + col;
        if (typeof mafCanEditCell === "function" && !mafCanEditCell(item, idx)) return;
        if (!plotBatch) { remember(); plotBatch = true; }
        writeTableCell(item, idx, yVal);
        pack = tableBytes(state.bin, item, all);
        paint({ skipEdit: true });
      }, function () { plotBatch = false; paint(); });
    }
    if (!opts.skipEdit) rebuildEdit();
    else {
      var g = editHost.querySelector("table");
      if (g && g.recolor) {
        var next = texts();
        var i;
        for (i = 0; i < next.length; i++) if (g._overlay) g._overlay[i] = next[i];
        g.recolor();
      }
    }
    if (typeof markCompareGrid === "function") markCompareGrid(editHost.querySelector("table"), item);
  }

  function selectedIds() {
    var grid = editHost.querySelector("table");
    return grid && grid.getSelected ? grid.getSelected() : [];
  }

  function needSel() {
    var ids = selectedIds();
    if (ids.length) return ids;
    tools.note(false, "Сначала выдели столбцы на таблице.");
    return null;
  }

  tools.onSet = function (text) {
    var ids = needSel();
    if (!ids) return;
    var v = parseCtp(text);
    if (v == null) { tools.note(false, "Введи число."); return; }
    remember();
    var i, n = 0;
    for (i = 0; i < ids.length; i++) if (writeTableCell(item, ids[i], v)) n++;
    pack = tableBytes(state.bin, item, all);
    paint();
    tools.note(true, "Записал в " + n + " яч.");
  };
  tools.onDelta = function (text, pct) {
    var ids = needSel();
    if (!ids) return;
    var d = parseCtp(text);
    if (d == null) { tools.note(false, "Введи число."); return; }
    var ctpText = texts();
    remember();
    var i;
    for (i = 0; i < ids.length; i++) {
      if (typeof mafCanEditCell === "function" && !mafCanEditCell(item, ids[i])) continue;
      var base = cellNum(ctpText[ids[i]]);
      if (base == null) continue;
      var next = pct ? base * (1 + d / 100) : base + d;
      writeTableCell(item, ids[i], next);
    }
    pack = tableBytes(state.bin, item, all);
    paint();
    tools.note(true, pct ? ("Изменил на " + d + "%") : ("Изменил на " + d));
  };
  tools.onInterp = function (a, b) {
    var ids = needSel();
    if (!ids || ids.length < 2) {
      tools.note(false, "Выдели диапазон: на краях уже стоят числа.");
      return;
    }
    var ctpText = texts();
    remember();
    var n = interpCells(ctpText, ids, layout.cols, a, b);
    if (!n) { tools.note(false, "На краях выделения нужны числа."); return; }
    writeTableRange(item, ids, ctpText.map(cellNum));
    pack = tableBytes(state.bin, item, all);
    paint();
    tools.note(true, "Интерполяция: " + n + " яч.");
  };

  rowRange.oninput = function () {
    activeRow = Number(rowRange.value) || 0;
    paint();
  };
  modeBox.onchange = function () {
    view3d = modeBox.checked;
    state.view3d = view3d;
    persistSession();
    paint({ skipEdit: true });
  };

  wrap.appendChild(h2);
  wrap.appendChild(meta);
  wrap.appendChild(rowBar);
  wrap.appendChild(host);
  wrap.appendChild(editCap);
  wrap.appendChild(tools);
  wrap.appendChild(editHost);
  var api = {
    bin: bin,
    get ctpText() { return texts(); },
    get layout() { return layout; },
    getSelected: selectedIds
  };
  if (typeof attachItemMenu === "function") {
    attachItemMenu(wrap, item, api);
    attachItemMenu(host, item, api);
    attachItemMenu(editHost, item, api);
  } else if (typeof attachCteMenu === "function") {
    attachCteMenu(wrap, item, api);
    attachCteMenu(host, item, api);
    attachCteMenu(editHost, item, api);
  }
  EditUndo.bind({
    undo: function () { applySnap(hist.undo(copyTableSpan(item))); },
    redo: function () { applySnap(hist.redo(copyTableSpan(item))); }
  });
  paint();
  return wrap;
}
