function flagBox() {
  var box = document.createElement("i");
  box.className = "flag-box";
  box.setAttribute("aria-hidden", "true");
  return box;
}

function bindFlagToggle(row, item, lab) {
  row.setAttribute("role", "checkbox");
  row.setAttribute("aria-checked", flagOn(state.bin, item) ? "true" : "false");
  row.tabIndex = 0;
  function apply(on) {
    row.classList.toggle("on", on);
    row.setAttribute("aria-checked", on ? "true" : "false");
    if (lab && lab.dataset.mode === "single") {
      lab.textContent = item.name + (on ? "  \u2014 \u0432\u043a\u043b" : "  \u2014 \u0432\u044b\u043a\u043b");
    }
  }
  function click() {
    var on = toggleFlag(item);
    if (on == null) return;
    apply(on);
  }
  row.onclick = click;
  row.onkeydown = function (e) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      click();
    }
  };
}

function renderFlag(item, bin) {
  var on = flagOn(bin, item);
  var hx = hexYX(item.addr);
  var wrap = document.createElement("div");
  wrap.className = "ctp-page";
  var row = document.createElement("div");
  row.className = "flag-row" + (on ? " on" : "");
  var lab = document.createElement("span");
  lab.dataset.mode = "single";
  lab.textContent = item.name + (on ? "  \u2014 \u0432\u043a\u043b" : "  \u2014 \u0432\u044b\u043a\u043b");
  row.appendChild(flagBox());
  row.appendChild(lab);
  bindFlagToggle(row, item, lab);
  var meta = document.createElement("p");
  meta.className = "hint";
  meta.textContent = "0x" + hx.addr + "  bit " + item.bit + "  \u2014 \u043a\u043b\u0438\u043a \u0432\u043a\u043b/\u0432\u044b\u043a\u043b";
  wrap.appendChild(row);
  wrap.appendChild(meta);
  return wrap;
}

function renderFlagFolder(item, bin) {
  var wrap = document.createElement("div");
  wrap.className = "ctp-page flags-page";
  var h2 = document.createElement("h2");
  h2.className = "ctp-map-title tight";
  h2.textContent = item.flagTitle || item.name;
  var hint = document.createElement("p");
  hint.className = "flag-hint";
  hint.textContent = "\u041a\u043b\u0438\u043a \u2014 \u0432\u043a\u043b/\u0432\u044b\u043a\u043b \u0431\u0438\u0442 \u0432 bin.";
  var list = document.createElement("div");
  list.className = "flag-list";
  (item.children || []).forEach(function (ch) {
    if (ch.kind === "label") {
      var h = document.createElement("div");
      h.className = "flag-sec";
      h.textContent = ch.name;
      list.appendChild(h);
      return;
    }
    if (ch.kind !== "flag") return;
    var on = flagOn(bin, ch);
    var row = document.createElement("div");
    row.className = "flag-row" + (on ? " on" : "");
    var lab = document.createElement("span");
    lab.textContent = ch.name;
    row.appendChild(flagBox());
    row.appendChild(lab);
    bindFlagToggle(row, ch, lab);
    list.appendChild(row);
  });
  wrap.appendChild(h2);
  wrap.appendChild(hint);
  wrap.appendChild(list);
  return wrap;
}
