function ctpRange(item) {
  var d = item.doubles || [];
  var unit = item.unit || "";
  if (typeof near === "function" && near(d, 150) && (near(d, 40) || near(d, 5))) return { min: -40, max: 150 };
  if (typeof near === "function" && near(d, 0.02)) return { min: 0, max: 5.1 };
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
  var origRaw = state.origBin ? readRaw(state.origBin, item) : raw;
  var orig = physValue(origRaw, item);
  var wrap = document.createElement("div");
  wrap.className = "ctp-page";
  var panel = document.createElement("div");
  panel.className = "ctp-panel";
  var h2 = document.createElement("h2");
  h2.textContent = item.name + (item.unit ? ", " + item.unit : "");
  var form = document.createElement("div");
  form.className = "ctp-form";

  function row(cls, lab, val, ro) {
    var l = document.createElement("label");
    l.textContent = lab;
    var inp = document.createElement("input");
    inp.readOnly = !!ro;
    inp.className = cls;
    inp.value = val;
    form.appendChild(l);
    form.appendChild(inp);
    return inp;
  }

  row("", "Максимальное значение", fmtCtp(rng.max), true);
  var cur = row("cur", "Текущее значение", fmtCtp(phys.value), false);
  row("prev", "Как было в файле", fmtCtp(orig.value), true);
  if (typeof hasCompare === "function" && hasCompare()) {
    var cmpRaw = readRaw(state.compareBin, item);
    var cmp = physValue(cmpRaw, item);
    row("cmp", "В " + (typeof plotFileLabel === "function" ? plotFileLabel("cmp") : (state.compareName || "сравниваемой")), fmtCtp(cmp.value), true);
    form.classList.add("has-cmp");
  }
  row("", "Минимальное значение", fmtCtp(rng.min), true);

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
  sub.textContent = "0x" + hx.addr + "   raw " + raw + "   " + phys.formula;

  function apply() {
    var v = parseCtp(cur.value);
    if (v == null) return;
    writeScalar(item, v);
    selectNode(item);
  }
  cur.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); apply(); }
  });
  cur.addEventListener("blur", apply);

  var box = document.createElement("div");
  box.className = "ctp-box";
  box.appendChild(el("div", "ctp-title", "Правка пишется в копию bin"));
  var actions = document.createElement("div");
  actions.className = "ctp-row";
  var back = document.createElement("button");
  back.type = "button";
  back.textContent = "Вернуть как было";
  back.onclick = function () { revertItem(item); };
  actions.appendChild(back);
  box.appendChild(actions);
  box.appendChild(el("p", "hint", "Enter или уход из поля — запись. Скачать итоговый файл — кнопка в шапке."));

  panel.appendChild(h2);
  panel.appendChild(form);
  panel.appendChild(sub);
  wrap.appendChild(panel);
  wrap.appendChild(box);
  return wrap;
}
