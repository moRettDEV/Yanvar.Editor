function fmtCtp(n) {
  if (n == null || !isFinite(n)) return "";
  var a = Math.abs(n);
  var d = a >= 100 ? 0 : a >= 1 ? 1 : 3;
  return n.toFixed(d).replace(".", ",");
}

function ctpRange(item) {
  var d = item.doubles || [];
  var unit = item.unit || "";
  if (near(d, 150) && (near(d, 40) || near(d, 5))) return { min: -40, max: 150 };
  if (near(d, 0.02)) return { min: 0, max: 5.1 };
  if (near(d, 48) && item.width === 2) return { min: 0, max: 65535 / 48 };
  if (hasUnit(unit, /\u043e\u0431/) && near(d, 30)) return { min: 0, max: 255 * 30 };
  if (hasUnit(unit, /\u043e\u0431/) && near(d, 40)) return { min: 0, max: 255 * 40 };
  var maxRaw = item.width === 2 ? 65535 : 255;
  var lo = physValue(0, item).value;
  var hi = physValue(maxRaw, item).value;
  if (d[0] > Math.max(lo, hi) * 0.2 && d[0] < Math.max(lo, hi) + 1) hi = d[0];
  return { min: Math.min(lo, hi), max: Math.max(lo, hi) };
}

function renderScalar(item, bin) {
  var raw = readRaw(bin, item);
  var phys = physValue(raw, item);
  var rng = ctpRange(item);
  var hx = hexYX(item.addr);
  var wrap = document.createElement("div");
  wrap.className = "ctp-page";
  var panel = document.createElement("div");
  panel.className = "ctp-panel";
  var h2 = document.createElement("h2");
  h2.textContent = item.name + (item.unit ? ", " + item.unit : "");
  var form = document.createElement("div");
  form.className = "ctp-form";
  function row(cls, lab, val) {
    var l = document.createElement("label");
    l.textContent = lab;
    var inp = document.createElement("input");
    inp.readOnly = true;
    inp.className = cls;
    inp.value = val;
    form.appendChild(l);
    form.appendChild(inp);
    return inp;
  }
  row("", "\u041c\u0430\u043a\u0441\u0438\u043c\u0430\u043b\u044c\u043d\u043e\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435", fmtCtp(rng.max));
  row("cur", "\u0422\u0435\u043a\u0443\u0449\u0435\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435", fmtCtp(phys.value));
  var prev = typeof Corrections !== "undefined" ? Corrections.find(item.name, "0x" + hx.addr) : null;
  row("prev", "\u041f\u0440\u043e\u0448\u043b\u043e\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435", fmtCtp(prev ? prev.ctpValue : phys.value));
  row("", "\u041c\u0438\u043d\u0438\u043c\u0430\u043b\u044c\u043d\u043e\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435", fmtCtp(rng.min));
  var meter = document.createElement("div");
  meter.className = "ctp-meter";
  var fill = document.createElement("div");
  fill.className = "fill";
  var t = (phys.value - rng.min) / (rng.max - rng.min);
  if (!isFinite(t)) t = 0;
  if (t < 0) t = 0;
  if (t > 1) t = 1;
  fill.style.height = Math.round(t * 100) + "%";
  meter.appendChild(fill);
  form.appendChild(meter);
  var sub = document.createElement("p");
  sub.className = "ctp-meta";
  sub.textContent = "HEX Y " + hx.y + "  X " + hx.x + "   0x" + hx.addr + "   raw " + raw + "   " + phys.formula;
  panel.appendChild(h2);
  panel.appendChild(form);
  panel.appendChild(sub);
  wrap.appendChild(panel);
  wrap.appendChild(makeCtpBox(item, bin, raw));
  return wrap;
}
