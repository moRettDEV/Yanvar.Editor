function spinBox(val) {
  var wrap = document.createElement("div");
  wrap.className = "ctp-spin";
  var inp = document.createElement("input");
  inp.type = "text";
  inp.value = val;
  inp.setAttribute("inputmode", "decimal");
  var col = document.createElement("div");
  col.className = "ctp-spin-btns";
  var up = document.createElement("button");
  up.type = "button";
  up.className = "ctp-spin-up";
  up.tabIndex = -1;
  var dn = document.createElement("button");
  dn.type = "button";
  dn.className = "ctp-spin-dn";
  dn.tabIndex = -1;
  function step(dir) {
    var n = parseCtp(inp.value);
    if (n == null) n = 0;
    n = Math.round((n + dir * 0.1) * 1000) / 1000;
    inp.value = String(n);
    inp.focus();
  }
  up.onclick = function (e) { e.preventDefault(); step(1); };
  dn.onclick = function (e) { e.preventDefault(); step(-1); };
  col.appendChild(up);
  col.appendChild(dn);
  wrap.appendChild(inp);
  wrap.appendChild(col);
  wrap.input = inp;
  return wrap;
}

function arrowBtn() {
  var b = document.createElement("button");
  b.type = "button";
  b.className = "ctp-go";
  b.title = "\u041f\u0440\u0438\u043c\u0435\u043d\u0438\u0442\u044c";
  b.textContent = "\u25b6";
  return b;
}

function drawInterpPreview(canvas, a, b, v0, v1) {
  var w = canvas.width;
  var h = canvas.height;
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#12141a";
  ctx.fillRect(0, 0, w, h);
  var pad = 8;
  var gw = w - pad * 2;
  var gh = h - pad * 2;
  ctx.strokeStyle = "#2a2e3a";
  ctx.lineWidth = 1;
  var i;
  for (i = 0; i <= 8; i++) {
    var x = pad + (gw * i) / 8;
    var y = pad + (gh * i) / 8;
    ctx.beginPath();
    ctx.moveTo(x, pad);
    ctx.lineTo(x, pad + gh);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(pad + gw, y);
    ctx.stroke();
  }
  function py(u) {
    var lo = v0;
    var hi = v1;
    if (lo == null || hi == null) {
      lo = 0;
      hi = 1;
    }
    var v = lo + (hi - lo) * u;
    var min = Math.min(lo, hi);
    var max = Math.max(lo, hi);
    if (max === min) max = min + 1;
    return pad + gh - ((v - min) / (max - min)) * gh;
  }
  ctx.beginPath();
  for (i = 0; i <= 40; i++) {
    var t = i / 40;
    var x = pad + t * gw;
    var y = py(interpBlend(t, a, b));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "#1c9c4a";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pad, py(0));
  ctx.lineTo(pad + gw, py(1));
  ctx.strokeStyle = "#3b5bfd";
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

function makeCtpTools() {
  var bar = document.createElement("div");
  bar.className = "ctp-tools";

  var axisLab = document.createElement("div");
  axisLab.className = "ctp-tools-axis";

  var setBox = document.createElement("div");
  setBox.className = "ctp-tool";
  setBox.appendChild(el("div", "ctp-tool-lab", "\u0423\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u044c \u0432"));
  var setRow = document.createElement("div");
  setRow.className = "ctp-tool-row";
  var setSpin = spinBox("0");
  var setGo = arrowBtn();
  setRow.appendChild(setSpin);
  setRow.appendChild(setGo);
  setBox.appendChild(setRow);
  setBox.appendChild(el("div", "ctp-pct ctp-pct-ph"));

  var chBox = document.createElement("div");
  chBox.className = "ctp-tool";
  chBox.appendChild(el("div", "ctp-tool-lab", "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043d\u0430"));
  var chRow = document.createElement("div");
  chRow.className = "ctp-tool-row";
  var chSpin = spinBox("0");
  var chGo = arrowBtn();
  chRow.appendChild(chSpin);
  chRow.appendChild(chGo);
  chBox.appendChild(chRow);
  var pctLab = document.createElement("label");
  pctLab.className = "ctp-pct";
  var pct = document.createElement("input");
  pct.type = "checkbox";
  pctLab.appendChild(pct);
  pctLab.appendChild(document.createTextNode("\u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432"));
  chBox.appendChild(pctLab);

  var prev = document.createElement("div");
  prev.className = "ctp-interp";
  var canvas = document.createElement("canvas");
  canvas.className = "ctp-interp-cv";
  canvas.width = 148;
  canvas.height = 96;
  var sliders = document.createElement("div");
  sliders.className = "ctp-rulers";
  var s1 = document.createElement("input");
  s1.type = "range";
  s1.min = "0";
  s1.max = "100";
  s1.value = "33";
  s1.title = "\u0420\u0435\u0437\u043a\u043e\u0441\u0442\u044c \u0432 \u043d\u0430\u0447\u0430\u043b\u0435";
  var s2 = document.createElement("input");
  s2.type = "range";
  s2.min = "0";
  s2.max = "100";
  s2.value = "67";
  s2.title = "\u0420\u0435\u0437\u043a\u043e\u0441\u0442\u044c \u0432 \u043a\u043e\u043d\u0446\u0435";
  sliders.appendChild(el("span", "ctp-ruler-lab", "\u0441\u0442\u0430\u0440\u0442"));
  sliders.appendChild(s1);
  sliders.appendChild(el("span", "ctp-ruler-lab", "\u043a\u043e\u043d\u0435\u0446"));
  sliders.appendChild(s2);
  var interpBtn = document.createElement("button");
  interpBtn.type = "button";
  interpBtn.className = "btn-interp";
  var ic = document.createElement("span");
  ic.className = "ic-interp";
  interpBtn.appendChild(ic);
  interpBtn.appendChild(document.createTextNode("\u0418\u043d\u0442\u0435\u0440\u043f\u043e\u043b\u044f\u0446\u0438\u044f"));
  prev.appendChild(canvas);
  prev.appendChild(sliders);
  prev.appendChild(interpBtn);

  var note = document.createElement("div");
  note.className = "ctp-tools-note";

  bar.appendChild(setBox);
  bar.appendChild(chBox);
  bar.appendChild(prev);
  bar.appendChild(axisLab);
  bar.appendChild(note);

  var ends = { v0: 0, v1: 1 };

  function coeffs() {
    return { a: Number(s1.value) / 100, b: Number(s2.value) / 100 };
  }

  function redraw() {
    drawInterpPreview(canvas, coeffs().a, coeffs().b, ends.v0, ends.v1);
  }

  s1.oninput = redraw;
  s2.oninput = redraw;
  redraw();

  bar.onSet = null;
  bar.onDelta = null;
  bar.onInterp = null;

  setGo.onclick = function () {
    if (typeof bar.onSet === "function") bar.onSet(setSpin.input.value);
  };
  setSpin.input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && typeof bar.onSet === "function") bar.onSet(setSpin.input.value);
  });
  chGo.onclick = function () {
    if (typeof bar.onDelta === "function") bar.onDelta(chSpin.input.value, pct.checked);
  };
  chSpin.input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && typeof bar.onDelta === "function") bar.onDelta(chSpin.input.value, pct.checked);
  });
  interpBtn.onclick = function () {
    var c = coeffs();
    if (typeof bar.onInterp === "function") bar.onInterp(c.a, c.b);
  };

  bar.setAxis = function (name) {
    axisLab.textContent = name || "";
  };
  bar.setEnds = function (v0, v1) {
    ends.v0 = v0;
    ends.v1 = v1;
    redraw();
  };
  bar.note = function (okFlag, text) {
    note.className = "ctp-tools-note" + (okFlag ? " ok" : "");
    note.textContent = text || "";
  };
  bar.setSelCount = function (n) {
    note.className = "ctp-tools-note";
    note.textContent = n ? ("\u0432\u044b\u0434\u0435\u043b\u0435\u043d\u043e: " + n) : "";
  };
  return bar;
}
