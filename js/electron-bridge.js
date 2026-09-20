(function () {
  if (!window.yanvar) return;

  function toU8(bytes) {
    if (!bytes) return null;
    if (bytes instanceof Uint8Array) return bytes;
    if (bytes instanceof ArrayBuffer) return new Uint8Array(bytes);
    if (bytes.type === "Buffer" && bytes.data) return new Uint8Array(bytes.data);
    return new Uint8Array(bytes);
  }

  function fromPick(res, fn) {
    if (!res || !res.bytes) return;
    fn(toU8(res.bytes), res.name);
  }

  promptOpenBin = function () {
    window.yanvar.pickBin().then(function (res) { fromPick(res, openBin); });
  };

  promptOpenMap = function () {
    if (!state.bin) return;
    window.yanvar.pickMap().then(function (res) { fromPick(res, openMap); });
  };

  promptOpenCompare = function () {
    window.yanvar.pickCompare().then(function (res) { fromPick(res, openCompare); });
  };

  downloadBin = function () {
    if (!state.bin) return;
    var out = typeof suggestBinName === "function" ? suggestBinName() : "firmware.bin";
    window.yanvar.saveBin(out, state.bin).then(function (saved) {
      if (!saved) return;
      if (typeof applySavedBinName === "function") applySavedBinName(saved);
      if (typeof setStatus === "function") setStatus("bin → " + saved + "  " + state.bin.length + " байт");
    });
  };

  pickCteFile = function (done) {
    window.yanvar.pickCte().then(function (res) {
      if (res && res.bytes) done(toU8(res.bytes), res.name);
    });
  };

  if (typeof exportCte === "function") {
    var prevExport = exportCte;
    exportCte = function (item, bin, ctpText, layout) {
      if (!item) return;
      var hx = typeof hexYX === "function" ? hexYX(item.addr) : { addr: "" };
      var saved = typeof Corrections !== "undefined" ? Corrections.find(item.name, "0x" + hx.addr) : null;
      var pack = collectCteValues(item, bin, ctpText, layout);
      var text = serializeCte(item, pack, saved);
      var bytes = typeof encodeCp1251 === "function" ? encodeCp1251(text) : new TextEncoder().encode(text);
      var safe = String(item.name || "table").replace(/[\\/:*?"<>|]+/g, " ").trim() + ".cte";
      window.yanvar.saveCte(safe, bytes).then(function (path) {
        if (!path) return;
        if (typeof setStatus === "function") setStatus("CTE → " + path + "  " + pack.values.length + " т.");
      });
    };
    exportCte._prev = prevExport;
  }

  function hijackLabel(id, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      fn();
    }, true);
  }

  hijackLabel("open-bin-item", promptOpenBin);
  hijackLabel("open-map-item", promptOpenMap);
  hijackLabel("open-compare-item", promptOpenCompare);
})();
