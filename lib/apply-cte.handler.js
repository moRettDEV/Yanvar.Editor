function findTableByCte(cte) {
  var selected = typeof state !== "undefined" ? state.selected : null;
  if (selected && selected.kind === "table") {
    if (!cte.name || selected.name === cte.name) return selected;
    if (typeof isMafCalib === "function" && isMafCalib(selected) && isMafCalib({ name: cte.name, kind: "table" })) {
      return selected;
    }
  }
  var list = typeof state !== "undefined" && state.map ? state.map.entries : [];
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i].kind === "table" && cte.name && list[i].name === cte.name) return list[i];
  }
  if (cte.id && /^[0-9A-Fa-f]{8}$/.test(cte.id)) {
    var a = parseInt(cte.id.slice(0, 4), 16);
    var b = parseInt(cte.id.slice(4), 16);
    if (a && a === b) {
      for (i = 0; i < list.length; i++) {
        if (list[i].kind === "table" && list[i].addr === a) return list[i];
      }
    }
  }
  if (typeof isMafCalib === "function") {
    for (i = 0; i < list.length; i++) {
      if (isMafCalib(list[i])) return list[i];
    }
  }
  return selected && selected.kind === "table" ? selected : null;
}

function applyCteBuf(u8, fileName) {
  var cte = typeof parseCte === "function" ? parseCte(u8) : null;
  if (!cte || !cte.count) {
    if (typeof setStatus === "function") setStatus("CTE empty: " + (fileName || ""));
    return Promise.resolve();
  }
  var item = findTableByCte(cte);
  if (!item) {
    if (typeof setStatus === "function") {
      setStatus("CTE \u00ab" + cte.name + "\u00bb \u2014 \u043e\u0442\u043a\u0440\u043e\u0439 .j5, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u0432\u0435\u0441\u0438\u0442\u044c \u043d\u0430 \u0442\u0430\u0431\u043b\u0438\u0446\u0443");
    }
    return Promise.resolve();
  }
  var hx = hexYX(item.addr);
  var cols = cte.cols || item.cols || cte.values.length;
  var rows = cte.rows || item.rows || 1;
  var n = rows * cols;
  var cells = [];
  var i;
  for (i = 0; i < n; i++) cells.push(cte.values[i] != null ? cte.values[i] : null);
  var maf = typeof isMafCalib === "function" && isMafCalib(item);
  var rec = {
    name: item.name,
    kind: "table",
    addr: "0x" + hx.addr,
    addrNum: item.addr,
    rows: rows,
    cols: cols,
    ctpCells: cells,
    source: "cte",
    verified: true,
    cteId: cte.id,
    cteFile: fileName || ""
  };
  if (maf) {
    rec.zScale = "kgh10";
    rec.xFrom = 0;
    rec.xTo = 5;
    rec.xName = "\u041d\u0430\u043f\u0440\u044f\u0436\u0435\u043d\u0438\u0435 \u0410\u0426\u041f \u0414\u041c\u0420\u0412";
    rec.zFrom = -100;
    rec.zTo = 1000;
    rec.zName = "\u0420\u0430\u0441\u0445\u043e\u0434 \u0432\u043e\u0437\u0434\u0443\u0445\u0430, \u043a\u0433/\u0447\u0430\u0441";
  }
  return Corrections.save(rec).then(function (res) {
    if (typeof setStatus === "function") {
      setStatus("CTE " + cte.name + " " + cte.count + " \u2192 " + item.name + (res.file ? "" : " (\u0431\u0440\u0430\u0443\u0437\u0435\u0440)"));
    }
    if (typeof selectNode === "function") selectNode(item);
  });
}
