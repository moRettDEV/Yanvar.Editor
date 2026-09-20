(function () {
  if (typeof Z_PRESETS !== "undefined") {
    Z_PRESETS.zone16 = {
      id: "zone16",
      label: "bit4  \u0437\u043e\u043d\u0430",
      toPhys: function (r) { return (r >> 4) & 1; },
      digits: 0,
      yMin: 0,
      yMax: 1,
      yStep: 1,
      yLabel: "\u0417\u043e\u043d\u0430"
    };
  }

  function isNoiseZone(item) {
    return !!(item && /\u0437\u043e\u043d\u0430 \u0430\u0434\u0430\u043f\u0442\u0430\u0446\u0438\u0438 \u043f\u043e \u0448\u0443\u043c\u0443/i.test(item.name || ""));
  }

  var prevKnown = typeof knownTableZ === "function" ? knownTableZ : function () { return null; };
  knownTableZ = function (item) {
    if (isNoiseZone(item)) return "zone16";
    return prevKnown(item);
  };

  var prevScale = typeof tableScale === "function" ? tableScale : null;
  tableScale = function (item) {
    var kn = knownTableZ(item);
    if (kn && typeof Z_PRESETS !== "undefined" && Z_PRESETS[kn]) {
      var p = Z_PRESETS[kn];
      var scale = {
        toPhys: p.toPhys,
        yMin: p.yMin,
        yMax: p.yMax,
        yStep: p.yStep,
        yLabel: p.yLabel || "",
        digits: p.digits,
        auto: p.auto
      };
      return typeof applyCustomZScale === "function"
        ? applyCustomZScale(scale, item && item.layout)
        : scale;
    }
    return prevScale ? prevScale(item) : { toPhys: function (r) { return r; }, digits: 0, auto: true };
  };

  var prevLock = typeof lockKnownTableZ === "function" ? lockKnownTableZ : null;
  lockKnownTableZ = function (item, L) {
    if (prevLock) prevLock(item, L);
    if (typeof isMafCalib === "function" && isMafCalib(item)) {
      if (typeof applyMafCalib === "function") applyMafCalib(item);
      if (typeof applyMafAxis === "function") applyMafAxis(L, item);
      if (item) item.wrap = false;
      return L;
    }
    if (!isNoiseZone(item) || !L) return L;
    L.z = "zone16";
    L.rows = 16;
    L.cols = 16;
    L.zName = "\u0417\u043e\u043d\u0430";
    L.zFrom = "0";
    L.zTo = "1";
    L.zStep = "1";
    return L;
  };

  var prevId = typeof cteIdOf === "function" ? cteIdOf : null;
  cteIdOf = function (item, saved) {
    if (isNoiseZone(item)) return "A00430C8";
    return prevId ? prevId(item, saved) : "00000000";
  };
})();
