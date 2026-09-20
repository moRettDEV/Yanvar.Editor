function folderPinHost(item) {
  var list = item && item.children;
  if (!list || !list.length) return null;
  var host = null;
  var i, n;
  for (i = 0; i < list.length; i++) {
    n = list[i];
    if (n.kind === "pin" && !n.zeroIsFirst) {
      if (host) return null;
      host = n;
    } else if (n.kind === "pin" && n.zeroIsFirst) {
      continue;
    } else if (n.kind === "flag" || n.kind === "label") {
      continue;
    } else {
      return null;
    }
  }
  return host;
}

function pinSelected(raw, opts, i, zeroIsFirst) {
  if (zeroIsFirst) return raw === i;
  if (raw === 0) return i < 0;
  if (raw === i + 1) return true;
  var m = /^(\d+)/.exec(opts[i] || "");
  return m && Number(m[1]) === raw;
}

function addPinRow(list, item, label, value, on, view) {
  var row = document.createElement("div");
  row.className = "flag-row" + (on ? " on" : "");
  row.appendChild(flagBox());
  var lab = document.createElement("span");
  lab.textContent = label;
  row.appendChild(lab);
  row.onclick = function () {
    setPin(item, value);
    selectNode(view || item);
  };
  list.appendChild(row);
}

function renderPin(item, bin, view) {
  var raw = readRaw(bin, item) || 0;
  var opts = item.options || [];
  var hx = hexYX(item.addr);
  var wrap = document.createElement("div");
  wrap.className = "ctp-page flags-page";
  var h2 = document.createElement("h2");
  h2.className = "ctp-map-title tight";
  h2.textContent = item.flagTitle || (view && view.name) || item.name;
  var hint = document.createElement("p");
  hint.className = "flag-hint";
  hint.textContent = !item.zeroIsFirst && raw === 0
    ? "\u041d\u043e\u0433\u0430 \u043d\u0435 \u0437\u0430\u0434\u0430\u043d\u0430. 0x" + hx.addr
    : "raw " + raw + "   0x" + hx.addr;
  var list = document.createElement("div");
  list.className = "flag-list";
  if (!item.zeroIsFirst) addPinRow(list, item, "\u043d\u0435 \u0437\u0430\u0434\u0430\u043d", 0, raw === 0, view);
  var i;
  for (i = 0; i < opts.length; i++) {
    addPinRow(list, item, opts[i], item.zeroIsFirst ? i : i + 1, pinSelected(raw, opts, i, item.zeroIsFirst), view);
  }
  wrap.appendChild(h2);
  wrap.appendChild(hint);
  wrap.appendChild(list);
  if (item.polarity && item.polarity.addr && item.polarity.names && item.polarity.names.length) {
    var pol = {
      kind: "pin",
      name: "\u041c\u0435\u0442\u043e\u0434 \u0430\u043a\u0442\u0438\u0432\u0430\u0446\u0438\u0438",
      addr: item.polarity.addr,
      zeroIsFirst: true,
      options: item.polarity.names
    };
    var sec = document.createElement("div");
    sec.className = "flag-sec";
    sec.textContent = pol.name;
    list.appendChild(sec);
    var pRaw = readRaw(bin, pol) || 0;
    for (i = 0; i < pol.options.length; i++) {
      addPinRow(list, pol, pol.options[i], i, pinSelected(pRaw, pol.options, i, true), view || item);
    }
  }
  if (item.extraFlags && item.extraFlags.length) {
    item.extraFlags.forEach(function (ch) {
      var on = typeof flagOn === "function" && flagOn(bin, ch);
      var row = document.createElement("div");
      row.className = "flag-row" + (on ? " on" : "");
      row.appendChild(flagBox());
      var lab = document.createElement("span");
      lab.textContent = ch.name;
      row.appendChild(lab);
      if (typeof bindFlagToggle === "function") bindFlagToggle(row, ch, lab);
      list.appendChild(row);
    });
  }
  return wrap;
}

function renderLabel(item) {
  var wrap = document.createElement("div");
  wrap.className = "ctp-page";
  var h2 = document.createElement("h2");
  h2.className = "ctp-map-title tight";
  h2.textContent = item.name;
  wrap.appendChild(h2);
  return wrap;
}
