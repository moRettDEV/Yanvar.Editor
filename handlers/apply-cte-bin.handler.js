function findTableByCte(cte) {
  if (!cte) return null;
  var list = state.map ? state.map.entries : [];
  var i;
  if (cte.id === "A00430C8" || /\u0437\u043e\u043d\u0430 \u0430\u0434\u0430\u043f\u0442\u0430\u0446\u0438\u0438 \u043f\u043e \u0448\u0443\u043c\u0443/i.test(cte.name || "")) {
    for (i = 0; i < list.length; i++) {
      if (list[i].kind === "table" && /\u0437\u043e\u043d\u0430 \u0430\u0434\u0430\u043f\u0442\u0430\u0446\u0438\u0438 \u043f\u043e \u0448\u0443\u043c\u0443/i.test(list[i].name || "")) {
        return list[i];
      }
    }
  }
  var selected = state.selected;
  if (selected && selected.kind === "table") {
    if (cte.name && selected.name === cte.name) return selected;
    if (typeof isMafCalib === "function" && isMafCalib(selected) && isMafCalib({ name: cte.name, kind: "table" })) {
      return selected;
    }
  }
  if (cte.name) {
    for (i = 0; i < list.length; i++) {
      if (list[i].kind === "table" && list[i].name === cte.name) return list[i];
    }
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
  return null;
}

function applyCteBuf(u8, fileName) {
  var cte = typeof parseCte === "function" ? parseCte(u8) : null;
  if (!cte || !cte.count) {
    setStatus("CTE пустой: " + (fileName || ""));
    return Promise.resolve();
  }
  var item = findTableByCte(cte);
  if (!item) {
    setStatus("CTE «" + (cte.name || fileName || "") + "» — открой именно эту таблицу");
    return Promise.resolve();
  }
  var n = 0;
  var skip = 0;
  var i;
  for (i = 0; i < cte.values.length; i++) {
    if (cte.values[i] == null) continue;
    if (typeof cellFits === "function" && !cellFits(state.bin, item, i)) {
      skip++;
      continue;
    }
    if (writeTableCell(item, i, cte.values[i])) n++;
  }
  setStatus(
    "CTE " + cte.name + " → bin  " + n + " яч." +
    (skip ? "  за краем файла " + skip : "") +
    "  " + (fileName || "")
  );
  selectNode(item);
  return Promise.resolve();
}
