var UNUSED_CTP = "\u0412\u044b\u0431\u0440\u0430\u043d\u043d\u0430\u044f \u043a\u0430\u043b\u0438\u0431\u0440\u043e\u0432\u043a\u0430 \u043d\u0435 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0441\u044f \u0432 \u044d\u0442\u043e\u043c \u041f\u041e.";

function isUnusedRec(rec) {
  return !!(rec && rec.source === "unused");
}

function markUnused(item) {
  if (!item || item.addr == null) return Promise.resolve(null);
  var hx = hexYX(item.addr);
  var rec = {
    name: item.name,
    kind: item.kind || "scalar",
    addr: "0x" + hx.addr,
    addrNum: item.addr,
    unit: item.unit || "",
    width: item.width || 1,
    source: "unused",
    formulaGuess: "unused",
    verified: true,
    ctpValue: null,
    binSize: typeof state !== "undefined" && state.bin ? state.bin.length : 0,
    savedAt: new Date().toISOString()
  };
  return Corrections.save(rec).then(function (res) {
    if (typeof onCorrectionSaved === "function") onCorrectionSaved();
    return res;
  });
}

function unusedNote(rec) {
  var p = document.createElement("p");
  p.className = "ctp-st unused";
  p.textContent = UNUSED_CTP;
  if (rec && rec.source === "unused") p.className += " ok";
  return p;
}
