function fmt(n, digits) {
  if (n == null || !isFinite(n)) return "";
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return n.toFixed(digits == null ? 3 : digits);
}

function parseCtp(s) {
  s = String(s).trim().replace(",", ".");
  if (!s) return null;
  var n = Number(s);
  return isFinite(n) ? n : null;
}

function correctionRec(item, bin, raw, ctpValue, source) {
  var hx = hexYX(item.addr);
  var viewer = raw == null ? null : physValue(raw, item).value;
  return {
    name: item.name,
    kind: item.kind || "scalar",
    addr: "0x" + hx.addr,
    addrNum: item.addr,
    raw: raw,
    width: item.width,
    unit: item.unit || "",
    doubles: item.doubles || [],
    ctpValue: ctpValue,
    viewerValue: viewer,
    source: source,
    verified: true,
    binSize: bin ? bin.length : 0
  };
}

function makeCtpBox(item, bin, raw) {
  var hx = hexYX(item.addr);
  var addr = "0x" + hx.addr;
  var prev = typeof Corrections !== "undefined" ? Corrections.find(item.name, addr) : null;
  var box = document.createElement("div");
  box.className = "ctp-box";
  var title = document.createElement("div");
  title.className = "ctp-title";
  title.textContent = "\u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0438\u0437 CTP";
  var row = document.createElement("div");
  row.className = "ctp-row";
  var inp = document.createElement("input");
  inp.type = "text";
  inp.className = "ctp-in";
  inp.placeholder = "80 \u0438\u043b\u0438 0,370";
  if (prev) inp.value = String(prev.ctpValue);
  var btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "\u0417\u0430\u043f\u0438\u0441\u0430\u0442\u044c";
  var ok = document.createElement("button");
  ok.type = "button";
  ok.className = "btn-confirm";
  ok.textContent = "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c";
  var unusedBtn = document.createElement("button");
  unusedBtn.type = "button";
  unusedBtn.textContent = "\u041d\u0435 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0441\u044f \u0432 \u041f\u041e";
  var st = document.createElement("p");
  st.className = "ctp-st";
  function showPrev() {
    if (prev && isUnusedRec(prev)) {
      st.className = "ctp-st unused ok";
      st.textContent = UNUSED_CTP;
      return;
    }
    if (!prev) {
      st.textContent = "\u0417\u0430\u043f\u0438\u0441\u0430\u0442\u044c \u2014 \u0447\u0438\u0441\u043b\u043e \u0438\u0437 CTP. \u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c \u2014 \u0442\u0435\u043a\u0443\u0449\u0435\u0435 \u0443\u0436\u0435 \u0432\u0435\u0440\u043d\u043e\u0435.";
      return;
    }
    var how = prev.source === "confirm" ? "\u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e" : "\u0437\u0430\u043f\u0438\u0441\u0430\u043d\u043e";
    st.textContent =
      how + ": " + prev.ctpValue +
      "   formula: " + (prev.formulaGuess || "?") +
      "   " + (Corrections.hasServer() ? "file ok" : "\u0437\u0430\u043f\u0443\u0441\u0442\u0438 start.cmd");
  }
  showPrev();
  var timer = null;
  function afterSave(res, rec, label) {
    prev = res.rec;
    st.className = "ctp-st ok";
    st.textContent =
      label + ": " + rec.ctpValue +
      "   formula: " + rec.formulaGuess +
      (res.file ? "   \u2192 data/corrections.json" : "   \u043d\u0435\u0442 \u0441\u0435\u0440\u0432\u0435\u0440\u0430, \u043e\u0442\u043a\u0440\u043e\u0439 \u0447\u0435\u0440\u0435\u0437 start.cmd");
    if (typeof onCorrectionSaved === "function") onCorrectionSaved();
  }
  function persist() {
    var v = parseCtp(inp.value);
    if (v == null) {
      st.textContent = "\u043d\u0443\u0436\u043d\u043e \u0447\u0438\u0441\u043b\u043e";
      st.className = "ctp-st warn";
      return;
    }
    var rec = correctionRec(item, bin, raw, v, "manual");
    Corrections.save(rec).then(function (res) { afterSave(res, rec, "\u0437\u0430\u043f\u0438\u0441\u0430\u043d\u043e"); });
  }
  function confirmNow() {
    var v = raw == null ? 1 : physValue(raw, item).value;
    inp.value = String(v);
    var rec = correctionRec(item, bin, raw, v, "confirm");
    Corrections.save(rec).then(function (res) { afterSave(res, rec, "\u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e"); });
  }
  unusedBtn.onclick = function () {
    markUnused(item).then(function (res) {
      if (!res) return;
      prev = res.rec;
      showPrev();
    });
  };
  btn.onclick = persist;
  ok.onclick = confirmNow;
  inp.addEventListener("keydown", function (e) {
    if (e.key === "Enter") persist();
  });
  inp.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (parseCtp(inp.value) != null) persist();
    }, 900);
  });
  row.appendChild(inp);
  row.appendChild(btn);
  row.appendChild(ok);
  row.appendChild(unusedBtn);
  box.appendChild(title);
  box.appendChild(row);
  box.appendChild(st);
  if (typeof Corrections !== "undefined" && Corrections.hasServer() === false) {
    var dl = document.createElement("button");
    dl.type = "button";
    dl.textContent = "\u0421\u043a\u0430\u0447\u0430\u0442\u044c JSON";
    dl.onclick = function () { Corrections.downloadBackup(); };
    box.appendChild(dl);
  }
  return box;
}

function renderDetail(item, bin, all) {
  if (typeof EditUndo !== "undefined") EditUndo.unbind();
  var el = document.getElementById("detail");
  el.innerHTML = "";
  if (!item) return;
  if (item.kind === "folder") {
    var pinHost = typeof folderPinHost === "function" ? folderPinHost(item) : null;
    if (pinHost) {
      if (!pinHost.flagTitle) pinHost.flagTitle = item.name;
      el.appendChild(renderPin(pinHost, bin, item));
      return;
    }
    var hasFlags = item.children && item.children.some(function (c) { return c.kind === "flag"; });
    if (hasFlags) {
      el.appendChild(renderFlagFolder(item, bin));
      return;
    }
    var h = document.createElement("h2");
    h.textContent = item.name;
    var p = document.createElement("p");
    p.textContent = (item.children ? item.children.length : 0) + " \u043f\u0443\u043d\u043a\u0442\u043e\u0432";
    el.appendChild(h);
    el.appendChild(p);
    return;
  }
  if (item.kind === "label") {
    el.appendChild(renderLabel(item));
    return;
  }
  if (item.kind === "flag") el.appendChild(renderFlag(item, bin));
  else if (item.kind === "pin") el.appendChild(renderPin(item, bin));
  else if (item.kind === "table") el.appendChild(renderTable(item, bin, all));
  else el.appendChild(renderScalar(item, bin));
}
