function gridMinMax(bytes, n) {
  var lo = 255, hi = 0;
  for (var i = 0; i < n; i++) {
    var v = bytes[i];
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  if (lo === hi) hi = lo + 1;
  return { lo: lo, hi: hi };
}

function heatColor(v, lo, hi) {
  var t = (v - lo) / (hi - lo);
  if (t < 0) t = 0;
  if (t > 1) t = 1;
  var r, g, b;
  if (t < 0.5) {
    var u = t * 2;
    r = 32 + 28 * u;
    g = 48 + 72 * u;
    b = 78 + 10 * u;
  } else {
    var u2 = (t - 0.5) * 2;
    r = 60 + 150 * u2;
    g = 120 - 28 * u2;
    b = 88 - 48 * u2;
  }
  return "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")";
}
