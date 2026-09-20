function textOf(item) {
  return ((item && item.name) || "") + " " + ((item && item.unit) || "") + " " + ((item && item.zUnit) || "");
}

function hasRe(s, re) {
  return re.test(s || "");
}

function applyCustomZScale(scale, L) {
  if (!scale || !L) return scale;
  if (L.z && typeof Z_PRESETS !== "undefined" && Z_PRESETS[L.z] && Z_PRESETS[L.z].yMax != null) {
    var preset = Z_PRESETS[L.z];
    var spanNeed = Math.abs(preset.yMax - (preset.yMin == null ? 0 : preset.yMin));
    var spanHave = cellNum(L.zFrom) != null && cellNum(L.zTo) != null
      ? Math.abs(cellNum(L.zTo) - cellNum(L.zFrom))
      : 0;
    if (spanHave < spanNeed * 0.2) {
      L.zFrom = String(preset.yMin == null ? 0 : preset.yMin);
      L.zTo = String(preset.yMax);
      if (preset.yStep != null) L.zStep = String(preset.yStep);
    }
  }
  var from = cellNum(L.zFrom);
  var to = cellNum(L.zTo);
  var step = cellNum(L.zStep);
  var count = cellNum(L.zCount);
  if (from != null && to != null) {
    scale.auto = false;
    scale.yMin = from;
    scale.yMax = to;
    if (step) scale.yStep = Math.abs(step);
  } else if (step && count > 1) {
    scale.auto = false;
    scale.yMin = from == null ? 0 : from;
    scale.yMax = scale.yMin + (count - 1) * step;
    scale.yStep = Math.abs(step);
  } else if (step) {
    scale.yStep = Math.abs(step);
  }
  if (L.zName) scale.yLabel = L.zName;
  if (scale.yStep && typeof axisDigits === "function") scale.axisDigits = axisDigits(scale.yStep);
  return scale;
}

function tableScaleCore(item) {
  var mapped = typeof scaleFromMap === "function" ? scaleFromMap(item) : null;
  if (mapped) return mapped;
  var L = item && item.layout;
  var zPick = L && L.z && L.z !== "auto" && L.z !== "raw" ? L.z : null;
  if (!zPick && typeof knownTableZ === "function") zPick = knownTableZ(item);
  if (zPick && Z_PRESETS[zPick]) {
    if (L) L.z = zPick;
    var p = Z_PRESETS[zPick];
    return {
      toPhys: p.toPhys,
      yMin: p.yMin,
      yMax: p.yMax,
      yStep: p.yStep,
      yLabel: p.yLabel || "",
      digits: p.digits,
      auto: p.auto
    };
  }
  var t = textOf(item);
  var unit = (item && item.unit) || "";
  if (hasRe(t, /\u043f\u0430\u043c\u044f\u0442\u044c \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u044f \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i)) {
    return {
      toPhys: function (r) { return r; },
      yMin: 0,
      yMax: 120,
      yStep: 10,
      yLabel: "\u0433\u0440\u0434",
      digits: 0
    };
  }
  if (hasRe(t, /\u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u0441\u043e\u0441\u0442\u0430\u0432\u0430 \u0441\u043c\u0435\u0441\u0438 \u043e\u0442 \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0438/i)) {
    return {
      toPhys: function (r) { return ((r > 127 ? r - 256 : r) * 14.7) / 256; },
      yMin: -10,
      yMax: 10,
      yStep: 1,
      yLabel: "ALF",
      digits: 1
    };
  }
  if (hasRe(t, /\u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u0442\u043e\u043f\u043b\u0438\u0432\u0430 \u0432 \u0440\u0435\u0436\u0438\u043c\u0435 Launch/i)) {
    return {
      toPhys: function (r) { return r / 128; },
      yMin: 0,
      yMax: 1.9,
      yStep: 0.1,
      yLabel: "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442",
      digits: 2
    };
  }
  if (hasRe(t, /\u0437\u0430\u0434\u0435\u0440\u0436\u043a\u0430 \u0440\u0435\u0433\u0443\u043b\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f (Lean-Rich|Rich-Lean)/i)) {
    return {
      toPhys: function (r) { return r * 0.02; },
      yMin: 0,
      yMax: 2,
      yStep: 0.2,
      yLabel: "\u0412\u0440\u0435\u043c\u044f, \u0441\u0435\u043a.",
      digits: 2
    };
  }
  if (hasRe(t, /\u0448\u0430\u0433 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u041a\u0420/i)) {
    return {
      toPhys: function (r) { return r / 256; },
      yMin: 0,
      yMax: 0.2,
      yStep: 0.02,
      yLabel: "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442",
      digits: 3
    };
  }
  if (hasRe(t, /\u0444\u0430\u0437\u0430 (?:\u043d\u0430\u0447\u0430\u043b\u0430|\u043e\u043a\u043e\u043d\u0447\u0430\u043d\u0438\u044f) \u0438\u0437\u043c\u0435\u0440\u0435\u043d\u0438\u044f \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i)) {
    return {
      toPhys: function (r) { return r * 6; },
      yMin: 0,
      yMax: 90,
      yStep: 10,
      yLabel: "\u0424\u0430\u0437\u0430, \u0433\u0440.\u043f.\u043a.\u0432.",
      digits: 0
    };
  }
  if (hasRe(t, /\u043e\u0442\u043d\u043e\u0441\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u043f\u043e\u0440\u043e\u0433 \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i)) {
    return {
      toPhys: function (r) { return r / 16; },
      yMin: 0,
      yMax: 10,
      yStep: 1,
      yLabel: "\u041f\u043e\u0440\u043e\u0433",
      digits: 2
    };
  }
  if (/^\s*\u041f\u043e\u0440\u043e\u0433 \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438\s/i.test(t) || hasRe(t, /^\u041f\u043e\u0440\u043e\u0433 \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438$/i)) {
    return {
      toPhys: function (r) { return r / 16; },
      yMin: 0,
      yMax: 4,
      yStep: 0.25,
      yLabel: "\u041f\u043e\u0440\u043e\u0433",
      digits: 2
    };
  }
  if (hasRe(t, /\u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u043f\u043e\u0440\u043e\u0433\u0430 \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i)) {
    return {
      toPhys: function (r) { return (r + 128) / 256; },
      yMin: 0.5,
      yMax: 1.4,
      yStep: 0.1,
      yLabel: "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442 \u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u0438",
      digits: 2
    };
  }
  if (hasRe(t, /\u0430\u0431\u0441\u043e\u043b\u044e\u0442\u043d\u044b\u0439 \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i)) {
    return {
      toPhys: function (r) { return (r * 5) / 256; },
      yMin: 0,
      yMax: 4.5,
      yStep: 0.5,
      yLabel: "\u041d\u0430\u043f\u0440\u044f\u0436\u0435\u043d\u0438\u0435, \u0412",
      digits: 2
    };
  }
  if (hasRe(t, /\u0437\u043e\u043d\u0430 \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u044f \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i)) {
    return {
      toPhys: function (r) { return r & 3; },
      yMin: 0,
      yMax: 3,
      yStep: 1,
      yLabel: "\u0417\u043e\u043d\u0430",
      digits: 0
    };
  }
  if (hasRe(t, /\u043e\u0431\u043e\u0440\u043e\u0442\u044b \u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u043f\u0440\u044b\u0441\u043a\u0430 \u043d\u0430 \u043b\u0430\u0443\u043d\u0447\u0435/i)) {
    return {
      toPhys: function (r) { return r * 40; },
      yMin: 2000,
      yMax: 10000,
      yStep: 1000,
      yLabel: "\u041e\u0431\u043e\u0440\u043e\u0442\u044b, \u043e\u0431/\u043c\u0438\u043d",
      digits: 0
    };
  }
  if (hasRe(t, /\u0432\u0435\u0441 \u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u0438 \u0426\u041d/i)) {
    return {
      toPhys: function (r) { return r / 256; },
      yMin: 0,
      yMax: 1,
      yStep: 0.1,
      yLabel: "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442",
      digits: 2
    };
  }
  if (hasRe(t, /\u043f\u043e\u043f\u0440\u0430\u0432\u043a\u0430\s*\u0426\u041d|\u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f\s*\u0426\u041d/i) || (hasRe(t, /\u043f\u0430\u043c\u044f\u0442\u044c \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u044f/i) && !hasRe(t, /\u0434\u0435\u0442\u043e\u043d\u0430\u0446/i))) {
    return {
      toPhys: function (r) { return r / 128; },
      yMin: 0,
      yMax: 1.9,
      yStep: 0.1,
      yLabel: "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442",
      digits: 2
    };
  }
  if (hasRe(t, /\u043a\u043e\u044d\u0444\u0444/i) && !hasRe(t, /GTC|ALF|\u0441\u043e\u0441\u0442\u0430\u0432/i)) {
    return {
      toPhys: function (r) { return r / 128; },
      yMin: 0,
      yMax: 1.9,
      yStep: 0.1,
      yLabel: "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442",
      digits: 2
    };
  }
  if (hasRe(t, /\u0410\u041b\u0424|\u0441\u043e\u0441\u0442\u0430\u0432\u0430? \u0441\u043c\u0435\u0441/i)) {
    return {
      toPhys: function (r) { return (14.7 * (r + 128)) / 256; },
      yMin: 7.5,
      yMax: 21.5,
      yStep: 0.5,
      yLabel: "ALF",
      digits: 1
    };
  }
  if (hasRe(t, /\u0444\u0430\u0437\u0430 \u0432\u043f\u0440\u044b\u0441\u043a\u0430 \u043e\u0442 /i)) {
    return {
      toPhys: function (r) { return r * 6; },
      yMin: 0,
      yMax: 700,
      yStep: 100,
      yLabel: "\u0433\u0440.\u043f.\u043a.\u0432.",
      digits: 0
    };
  }
  if (hasRe(t, /\u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u0423\u041e\u0417 \u043e\u0442 \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0438/i)) {
    return {
      toPhys: function (r) {
        var v = r > 127 ? (r - 256) / 2 : r / 2;
        if (v > 20) return 20;
        if (v < -20) return -20;
        return v;
      },
      yMin: -20,
      yMax: 20,
      yStep: 5,
      yLabel: "\u0433\u0440.\u043f.\u043a.\u0432.",
      digits: 1
    };
  }
  if (hasRe(t, /\u0423\u041e\u0417|\u0433\u0440\.?\s*\u043f\.?\s*\u043a\.?\s*\u0432/i)) {
    return {
      toPhys: function (r) { return r > 127 ? (r - 256) / 2 : r / 2; },
      yLabel: "\u0433\u0440.\u043f.\u043a.\u0432.",
      digits: 1,
      auto: true
    };
  }
  var zUnit = (item && item.zUnit) || "";
  if (hasRe(zUnit, /\u043c\u0433\/\u0446\u0438\u043a\u043b\/\u0441\u0435\u043a/) || hasRe(t, /GTC/i)) {
    return {
      toPhys: function (r) { return r / 3.6; },
      yLabel: "\u043c\u0433/\u0446\u0438\u043a\u043b/\u0441\u0435\u043a",
      digits: 1,
      yMin: 0,
      yMax: 70
    };
  }
  if (hasRe(zUnit, /\u043e\u0431\/\u043c\u0438\u043d/) || hasRe(t, /\u043e\u0431\u043e\u0440\u043e\u0442\u044b \u043f\u043e\u043b\u043d\u043e\u0433\u043e \u0432\u044b\u0445\u043e\u0434\u0430/i)) {
    return {
      toPhys: function (r) { return r * 10; },
      yLabel: "\u041e\u0431\u043e\u0440\u043e\u0442\u044b, \u043e\u0431/\u043c\u0438\u043d",
      digits: 0,
      yMin: 0,
      yMax: 2500,
      yStep: 100
    };
  }
  if (hasRe(t, /\u043c\u0430\u043b\u0430\u044f \u0446\u0438\u043a\u043b\u043e\u0432\u0430\u044f \u043f\u043e\u0434\u0430\u0447\u0430|\u0431\u043e\u043b\u044c\u0448\u0430\u044f \u0446\u0438\u043a\u043b\u043e\u0432\u0430\u044f \u043f\u043e\u0434\u0430\u0447\u0430/i)) {
    return {
      toPhys: function (r) { return (r * 256) / 90; },
      yLabel: "\u043c\u0433/\u0446\u0438\u043a\u043b",
      digits: 0,
      yMin: 0,
      yMax: 700,
      yStep: 50
    };
  }
  if (hasRe(t, /\u0430\u0441\u0438\u043d\u0445\u0440\u043e\u043d\u043d\u0430\u044f \u0446\u0438\u043a\u043b\u043e\u0432\u0430\u044f/i)) {
    return {
      toPhys: function (r) { return (r * 256) / 180; },
      yLabel: "\u043c\u0433/\u0446\u0438\u043a\u043b",
      digits: 0,
      yMin: 0,
      yMax: 360,
      yStep: 20
    };
  }
  if (hasRe(t, /^\u0411\u0426\u041d \u043f\u043e \u0434\u0430\u0432\u043b/i)) {
    return {
      toPhys: function (r) { return (r * 256) / 48; },
      yLabel: "\u043c\u0433/\u0446\u0438\u043a\u043b",
      digits: 0,
      yMin: 0,
      yMax: 1200,
      yStep: 100
    };
  }
  if (hasRe(t, /^\u0411\u0426\u041d \u043f\u043e \u0434\u0440\u043e\u0441\u0441/i)) {
    return {
      toPhys: function (r) { return (r * 256) / 96; },
      yLabel: "\u043c\u0433/\u0446\u0438\u043a\u043b",
      digits: 0,
      yMin: 0,
      yMax: 600,
      yStep: 100
    };
  }
  if (hasRe(t, /\u0442\u0430\u0440\u0438\u0440\u043e\u0432\u043a\u0430 \u0414\u041c\u0420\u0412/i)) {
    return {
      toPhys: function (r) { return (r - 1000) / 10; },
      yLabel: "\u0420\u0430\u0441\u0445\u043e\u0434 \u0432\u043e\u0437\u0434\u0443\u0445\u0430, \u043a\u0433/\u0447\u0430\u0441",
      digits: 1,
      yMin: -100,
      yMax: 1000,
      yStep: 100
    };
  }
  if (hasRe(unit, /\u043c\u0433/i) || hasRe(t, /\u0411\u0426\u041d|\u0047\u0042\u0043/i)) {
    return {
      toPhys: function (r) { return r; },
      yLabel: unit || "\u043c\u0433/\u0446\u0438\u043a\u043b",
      digits: 0,
      auto: true
    };
  }
  var phys = {
    toPhys: function (r) { return physValue(r, item).value; },
    yLabel: unit || "raw",
    digits: 2,
    auto: true
  };
  return phys;
}

function tableScale(item) {
  return applyCustomZScale(tableScaleCore(item), item && item.layout);
}

function axisFromText(t, n, kind) {
  t = (t || "").toLowerCase();
  if (hasRe(t, /\u0442\u0435\u043c\u043f\u0435\u0440/)) {
    return { min: -40, max: 150, label: "\u0422\u0435\u043c\u043f\u0435\u0440\u0430\u0442\u0443\u0440\u0430, \u0433\u0440\u0430\u0434.C", digits: 0 };
  }
  if (hasRe(t, /\u043e\u0431\u043e\u0440\u043e\u0442|\u043e\u0431\/\u043c\u0438\u043d|\u0072\u0070\u006d/)) {
    return { min: 0, max: 6400, label: "\u041e\u0431\u043e\u0440\u043e\u0442\u044b, \u043e\u0431/\u043c\u0438\u043d", digits: 0 };
  }
  if (hasRe(t, /\u0434\u0440\u043e\u0441\u0441\u0435\u043b|%/)) {
    return { min: 0, max: 100, label: "\u0414\u0440\u043e\u0441\u0441\u0435\u043b\u044c, %", digits: 0 };
  }
  if (hasRe(t, /\u043d\u0430\u043f\u0440\u044f\u0436|\u0432\u043e\u043b\u044c\u0442|\u0410\u0426\u041f/)) {
    return { min: 0, max: 5, label: "\u041d\u0430\u043f\u0440\u044f\u0436\u0435\u043d\u0438\u0435, \u0412", digits: 2 };
  }
  if (hasRe(t, /\u0434\u0430\u0432\u043b\u0435\u043d|\u043a\u041f\u0430/)) {
    return { min: 20, max: 100, label: "\u0414\u0430\u0432\u043b\u0435\u043d\u0438\u0435, \u043a\u041f\u0430", digits: 0 };
  }
  if (hasRe(t, /\u0441\u0435\u043a/)) {
    return { min: 0, max: 10, label: "\u0412\u0440\u0435\u043c\u044f, \u0441\u0435\u043a", digits: 2 };
  }
  if (hasRe(t, /\u0446\u0438\u043a\u043b|\u0442\u0430\u043a\u0442/)) {
    return { min: 0, max: 255, label: "\u0426\u0438\u043a\u043b", digits: 0 };
  }
  if (hasRe(t, /\u043c\u0433|\u0047\u0042\u0043|\u0411\u0426\u041d/)) {
    return { min: 0, max: 600, label: "\u043c\u0433/\u0446\u0438\u043a\u043b", digits: 0 };
  }
  return { min: 0, max: Math.max(0, n - 1), label: "\u0442\u043e\u0447\u043a\u0430", digits: 0 };
}

function axisX(item, cols) {
  if (typeof resolveAxis === "function") return resolveAxis("col", cols, item);
  return axisFromText(((item && item.unit) || "") + " " + ((item && item.name) || ""), cols, "col");
}

function axisY(item, rows) {
  if (rows <= 1) return null;
  if (typeof resolveAxis === "function") return resolveAxis("row", rows, item);
  return axisFromText((item && item.name) || "", rows, "row");
}

function axisAt(ax, i, n) {
  if (!ax) return i;
  if (ax.values && ax.values.length) {
    var j = i < 0 ? 0 : i > ax.values.length - 1 ? ax.values.length - 1 : i;
    return ax.values[j];
  }
  if (ax.step != null && isFinite(ax.step) && ax.step !== 0) {
    return Number(ax.min) + i * Number(ax.step);
  }
  if (n <= 1) return ax.min;
  return ax.min + ((ax.max - ax.min) * i) / (n - 1);
}

function niceTicks(min, max, want, stepFix) {
  if (!(max > min)) max = min + 1;
  want = want || 10;
  var span = max - min;
  var step;
  if (stepFix > 0) {
    step = stepFix;
  } else {
    step = Math.pow(10, Math.floor(Math.log(span / want) / Math.LN10));
    var err = span / want / step;
    if (err >= 7.5) step *= 10;
    else if (err >= 3) step *= 5;
    else if (err >= 1.5) step *= 2;
    if (max <= 2.2 && min >= 0 && step > 0.1) step = 0.1;
  }
  var tmin = Math.floor(min / step) * step;
  var tmax = Math.ceil(max / step) * step;
  var ticks = [];
  for (var v = tmin; v <= tmax + step * 0.01; v = +(v + step).toFixed(10)) ticks.push(v);
  return { min: tmin, max: tmax, ticks: ticks, step: step };
}

function fmtTick(v, digits) {
  if (digits == null) {
    digits = Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2;
  }
  if (digits === 0 && Math.abs(v - Math.round(v)) > 1e-6) {
    digits = typeof axisDigits === "function" ? Math.max(1, axisDigits(v)) : 1;
  }
  if (digits === 0) return String(Math.round(v));
  var s = v.toFixed(digits);
  if (digits > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s;
}

function fmtPoint(v, digits) {
  if (digits == null) digits = 2;
  if (digits === 0) return String(Math.round(v));
  return v.toFixed(digits);
}

function tableCells(bytes, rows, cols, item) {
  var scale = tableScale(item);
  var xAx = axisX(item, cols);
  var yAx = axisY(item, rows);
  var out = [];
  var i, r, c, raw, phys;
  for (r = 0; r < rows; r++) {
    for (c = 0; c < cols; c++) {
      i = r * cols + c;
      raw = typeof cellRaw === "function" ? cellRaw(bytes, i, item) : bytes[i];
      phys = raw == null || raw === "" ? NaN : scale.toPhys(raw);
      out.push({
        r: r,
        c: c,
        raw: raw,
        v: phys,
        x: axisAt(xAx, c, cols),
        yRow: yAx ? axisAt(yAx, r, rows) : r
      });
    }
  }
  return { cells: out, scale: scale, xAx: xAx, yAx: yAx };
}
