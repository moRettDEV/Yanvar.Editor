function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function edField(val, ph, cls) {
  var n = document.createElement("input");
  n.type = "text";
  n.className = cls || "fix-num";
  n.placeholder = ph || "";
  n.value = val == null || val === "" ? "" : String(val);
  return n;
}

function makeTableFix(item, bin, bytes, layout, onChange) {
  applyTableLayout(item, layout);
  var box = el("div", "ctp-box table-fix");
  box.appendChild(el("div", "ctp-title", "\u041e\u0441\u0438 \u0438 \u0437\u0430\u043b\u0438\u0432\u043a\u0430"));
  box.appendChild(el("p", "fix-help", "\u041e\u0441\u0438 \u0433\u0440\u0430\u0444\u0438\u043a\u0430. \u041f\u0440\u0430\u0432\u043a\u0430 \u0447\u0438\u0441\u0435\u043b \u2014 \u043f\u0430\u043d\u0435\u043b\u044c \u043d\u0430\u0434 \u0437\u0435\u043b\u0451\u043d\u043e\u0439 \u0442\u0430\u0431\u043b\u0438\u0446\u0435\u0439."));

  function axisRow(title, name, from, to, step) {
    var wrap = el("div", "axis-ed");
    wrap.appendChild(el("b", "axis-ed-lab", title));
    wrap.appendChild(name);
    wrap.appendChild(from);
    wrap.appendChild(to);
    wrap.appendChild(step);
    return wrap;
  }

  var zName = edField(layout.zName, "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435", "fix-name");
  var zFrom = edField(layout.zFrom, "\u043e\u0442");
  var zTo = edField(layout.zTo, "\u0434\u043e");
  var zStep = edField(layout.zStep, "\u0448\u0430\u0433");
  var xName = edField(layout.xName, "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435", "fix-name");
  var xFrom = edField(layout.xFrom, "\u043e\u0442");
  var xTo = edField(layout.xTo, "\u0434\u043e");
  var xStep = edField(layout.xStep, "\u0448\u0430\u0433");

  var head = el("div", "axis-ed axis-ed-h");
  head.appendChild(el("span", "", ""));
  head.appendChild(el("span", "", "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435"));
  head.appendChild(el("span", "", "\u043e\u0442"));
  head.appendChild(el("span", "", "\u0434\u043e"));
  head.appendChild(el("span", "", "\u0448\u0430\u0433"));

  var st = el("p", "ctp-st", "");
  var btns = el("div", "ctp-row");
  var save = el("button", "", "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043f\u0440\u0430\u0432\u043a\u0443");
  var ok = el("button", "btn-confirm", "\u0412\u0441\u0451 \u043a\u0430\u043a \u0432 CTP");
  var unusedBtn = el("button", "", "\u041d\u0435 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0441\u044f \u0432 \u041f\u041e");
  btns.appendChild(ok);
  btns.appendChild(save);
  btns.appendChild(unusedBtn);

  box.appendChild(head);
  box.appendChild(axisRow("\u041b\u0438\u043d\u0438\u0438", zName, zFrom, zTo, zStep));
  box.appendChild(axisRow("\u0421\u0442\u043e\u043b\u0431\u0446\u044b", xName, xFrom, xTo, xStep));
  box.appendChild(st);
  box.appendChild(btns);
  [zName, zFrom, zTo, zStep, xName, xFrom, xTo, xStep].forEach(function (n) {
    n.addEventListener("mousedown", function (e) { e.stopPropagation(); });
  });

  function readLayout() {
    layout.zName = zName.value;
    layout.zFrom = zFrom.value;
    layout.zTo = zTo.value;
    layout.zStep = zStep.value;
    layout.xName = xName.value;
    layout.xFrom = xFrom.value;
    layout.xTo = xTo.value;
    layout.xStep = xStep.value;
    applyAxisCounts(layout, bytes.length);
    applyTableLayout(item, layout);
    return layout;
  }

  function persist(source, quiet) {
    readLayout();
    var hx = hexYX(item.addr);
    var cells = (layout.ctpText || []).map(cellNum);
    var first = filledCellPairs(bytes, layout.ctpText || [])[0];
    var rec = {
      name: item.name,
      kind: "table",
      addr: "0x" + hx.addr,
      addrNum: item.addr,
      unit: item.unit || "",
      zUnit: item.zUnit || "",
      doubles: item.doubles || [],
      rows: layout.rows,
      cols: layout.cols,
      zScale: layout.z,
      xAxis: layout.x,
      yAxis: layout.y,
      xMin: layout.xMin,
      xMax: layout.xMax,
      yMin: layout.yMin,
      yMax: layout.yMax,
      xName: layout.xName,
      xFrom: layout.xFrom,
      xTo: layout.xTo,
      xStep: layout.xStep,
      xCount: layout.xCount,
      zName: layout.zName,
      zFrom: layout.zFrom,
      zTo: layout.zTo,
      zStep: layout.zStep,
      zCount: layout.zCount,
      ctpCells: cells,
      source: source,
      verified: true,
      binSize: bin ? bin.length : 0,
      raw: first ? first.raw : bytes[0],
      ctpValue: first ? first.ctp : (Z_PRESETS[layout.z] ? Z_PRESETS[layout.z].toPhys(bytes[0]) : bytes[0])
    };
    Corrections.save(rec).then(function (res) {
      if (!quiet) {
        st.className = "ctp-st ok";
        st.textContent = source === "confirm"
          ? "\u0417\u0430\u043f\u043e\u043c\u043d\u0438\u043b: \u0442\u0430\u0431\u043b\u0438\u0446\u0430 \u0441\u0445\u043e\u0434\u0438\u0442\u0441\u044f \u0441 CTP."
          : "\u041f\u0440\u0430\u0432\u043a\u0430 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430.";
        if (!res.file) st.textContent += " \u0417\u0430\u043f\u0443\u0441\u0442\u0438 start.cmd, \u0447\u0442\u043e\u0431\u044b \u044f \u0442\u043e\u0436\u0435 \u0443\u0432\u0438\u0434\u0435\u043b.";
      }
      if (typeof onCorrectionSaved === "function") onCorrectionSaved();
    });
  }

  function emit() { onChange(readLayout()); }

  [zName, zFrom, zTo, zStep, xName, xFrom, xTo, xStep].forEach(function (n) {
    n.addEventListener("change", emit);
  });
  save.onclick = function () { persist("manual"); };
  ok.onclick = function () { persist("confirm"); };
  unusedBtn.onclick = function () {
    markUnused(item).then(function (res) {
      if (!res) return;
      st.className = "ctp-st unused ok";
      st.textContent = UNUSED_CTP;
    });
  };
  var prevRec = typeof Corrections !== "undefined" ? Corrections.find(item.name, "0x" + hexYX(item.addr).addr) : null;
  if (prevRec && isUnusedRec(prevRec)) {
    st.className = "ctp-st unused ok";
    st.textContent = UNUSED_CTP;
  }

  box.setZ = function (id) {
    if (id) layout.z = id;
  };
  box.persistQuiet = function () { persist("manual", true); };
  box.note = function (okFlag, text) {
    st.className = okFlag ? "ctp-st ok" : "ctp-st";
    st.textContent = text || "";
  };
  return box;
}
