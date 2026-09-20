function nameOk(s) {
  if (!s || s.length < 4) return false;
  if (!/[A-Za-z\u0400-\u04ff]/.test(s)) return false;
  if (/^[\.\,\;\:\!\?]/.test(s)) return false;
  return true;
}

function collectNames(buf) {
  var list = [];
  for (var i = 16; i < buf.length - 8; i++) {
    var len = buf[i];
    if (len < 4 || len > 90) continue;
    var ok = true;
    var letters = 0;
    for (var j = 0; j < len; j++) {
      var b = buf[i + 1 + j];
      if (!isNameChar(b)) {
        ok = false;
        break;
      }
      if ((b >= 0x41 && b <= 0x7a) || b >= 0xc0) letters++;
    }
    if (!ok || letters < 3) continue;
    var name = cp1251(buf, i + 1, len);
    if (!nameOk(name)) continue;
    list.push({ off: i, name: name, recOff: skipZeros(buf, i + 1 + len) });
    i += len;
  }
  return list;
}

function looksLikeName(buf, o) {
  if (o >= buf.length) return false;
  var len = buf[o];
  if (len < 4 || len > 90 || o + 1 + len > buf.length) return false;
  var letters = 0;
  for (var j = 0; j < len; j++) {
    var b = buf[o + 1 + j];
    if (!isNameChar(b)) return false;
    if ((b >= 0x41 && b <= 0x7a) || b >= 0xc0) letters++;
  }
  return letters >= 3;
}

function parseRecord(buf, o, xorKey) {
  if (o + 12 >= buf.length) return null;
  if (buf[o] >= 1 && buf[o] <= 4 && buf[o + 1] === 0 && buf[o + 2] === 0 && buf[o + 3] === 0
    && looksLikeName(buf, o + 4)) {
    return { kind: "folder", nest: buf[o] };
  }
  if (buf[o] === 1 && buf[o + 1] === 4 && buf[o + 3] === 0x12) {
    return { kind: "folder", nest: 1, addr: takeAddr(buf, o + 8, xorKey) };
  }
  if (buf[o] >= 2 && buf[o] <= 6 && buf[o + 1] === 4 && buf[o + 3] === 0x12) {
    return fillPin(buf, o, xorKey);
  }
  if (buf[o] === 1 && buf[o + 1] === 5) {
    return { kind: "folder", nest: 1 };
  }
  if (buf[o] >= 1 && buf[o] <= 6) {
    var b1 = buf[o + 1];
    var b2 = buf[o + 2];
    var b3 = buf[o + 3];
    var scalar = b1 === 3 && (b2 === 0x5f || b2 === 0x65) && b3 === 0;
    var table = (b1 === 2 && (b2 === 0xdc || b2 === 0xe2) && b3 === 2)
      || (b1 === 1 && b2 === 0xa8 && b3 === 1);
    if (scalar || table) return fillCalib(buf, o, xorKey, table ? "table" : "scalar");
  }
  return null;
}

function takeAddr(buf, o, xorKey) {
  var raw = u32(buf, o);
  if (!xorKey) return raw > 0xffff ? u16(buf, o) : raw;
  var a = (raw ^ xorKey) >>> 0;
  if (a > 0xffff) a = raw > 0xffff ? (u16(buf, o) ^ (xorKey & 0xffff)) & 0xffff : raw;
  return a & 0xffff;
}

function parsePinAddrs(buf, o, xorKey) {
  var p = o + 4;
  if (p + 3 < buf.length && buf[p + 3] === 0xfe) p += 4;
  var seen = {};
  var out = [];
  while (p + 1 < buf.length && out.length < 3) {
    var a = takeAddr(buf, p, xorKey);
    if (!a) break;
    if (seen[a]) {
      p += 4;
      continue;
    }
    seen[a] = 1;
    out.push(a);
    p += 4;
  }
  return out;
}

function fillPin(buf, o, xorKey) {
  var addrs = parsePinAddrs(buf, o, xorKey);
  return {
    kind: "pin",
    nest: buf[o],
    addr: addrs[0] || 0,
    flagAddr: addrs[1] || 0,
    width: 1,
    options: [],
    rec: o
  };
}

var DEFAULT_ECU_INS = [
  "41-\u0439 \u0432\u044b\u0432\u043e\u0434 \u042d\u0411\u0423, \u043f\u043e\u0434\u0442\u044f\u0436\u043a\u0430 \u043d\u0430 \u0437\u0435\u043c\u043b\u044e",
  "42-\u0439 \u0432\u044b\u0432\u043e\u0434 \u042d\u0411\u0423, \u043f\u043e\u0434\u0442\u044f\u0436\u043a\u0430 \u043d\u0430 +5 \u0432\u043e\u043b\u044c\u0442",
  "50-\u0439 \u0432\u044b\u0432\u043e\u0434 \u042d\u0411\u0423, \u043f\u043e\u0434\u0442\u044f\u0436\u043a\u0430 \u043d\u0430 \u0437\u0435\u043c\u043b\u044e",
  "51-\u0439 \u0432\u044b\u0432\u043e\u0434 \u042d\u0411\u0423, \u043f\u043e\u0434\u0442\u044f\u0436\u043a\u0430 \u043d\u0430 +5 \u0432\u043e\u043b\u044c\u0442",
  "52-\u0439 \u0432\u044b\u0432\u043e\u0434 \u042d\u0411\u0423, \u043f\u043e\u0434\u0442\u044f\u0436\u043a\u0430 \u043d\u0430 +5 \u0432\u043e\u043b\u044c\u0442",
  "39-\u0439 \u0432\u044b\u0432\u043e\u0434 \u042d\u0411\u0423, \u043f\u043e\u0434\u0442\u044f\u0436\u043a\u0430 \u043d\u0430 \u0437\u0435\u043c\u043b\u044e",
  "44-\u0439 \u0432\u044b\u0432\u043e\u0434 \u042d\u0411\u0423, \u043f\u043e\u0434\u0442\u044f\u0436\u043a\u0430 \u043d\u0430 +5 \u0432\u043e\u043b\u044c\u0442"
];

function isEcuIoTitle(name) {
  return /^\u0423\u043f\u0440\u0430\u0432\u043b\u044f\u044e\u0449\u0438\u0439 \u0432\u044b\u0445\u043e\u0434 \u042d\u0411\u0423$/i.test(name || "")
    || /^\u0423\u043f\u0440\u0430\u0432\u043b\u044f\u044e\u0449\u0438\u0439 \u0432\u044b\u0432\u043e\u0434 \u042d\u0411\u0423$/i.test(name || "");
}

function isOutMaskChild(name) {
  return /^(\u0421\u0438\u0433\u043d\u0430\u043b|\u041b\u0430\u043c\u043f\u0430) \u043d\u0430 \d+ \u0432\u044b\u0432\u043e\u0434\u0435$/i.test(name || "");
}

function peekOutMaskBits(names, i) {
  var j;
  for (j = i + 1; j < names.length && j <= i + 8; j++) {
    var nm = names[j].name || "";
    if (isEcuIoTitle(nm)) continue;
    if (isPinSectionSkip(nm, "", "")) continue;
    return isOutMaskChild(nm);
  }
  return false;
}

function lastFolder(entries) {
  var i;
  for (i = (entries || []).length - 1; i >= 0; i--) {
    if (entries[i].kind === "folder") return entries[i];
  }
  return null;
}

function beginOutMask(entries, name, addr, nest, mapOff) {
  finishPinOptions(entries[entries.length - 1]);
  var last = lastFolder(entries);
  if (last && /^\u0423\u043f\u0440\u0430\u0432\u043b\u044f\u044e\u0449\u0438\u0439 \u0432\u044b\u0445\u043e\u0434$/i.test(name || "")) {
    last.addr = addr;
    last.flagTitle = name;
    return { flagMode: true, flagAddrs: addr ? [addr] : [], bitPos: 0, flagFolder: last.name, siblingNest: 0 };
  }
  var depth = nest || 2;
  entries.push({
    name: name,
    kind: "folder",
    nest: depth,
    addr: addr,
    mapOff: mapOff
  });
  return { flagMode: true, flagAddrs: addr ? [addr] : [], bitPos: 0, flagFolder: name, siblingNest: depth };
}

function isPinChoice(name, pinName) {
  name = name || "";
  pinName = pinName || "";
  if (isEcuIoTitle(name) || isOutMaskChild(name)) return false;
  if (/^\u0412\u044b\u0432\u043e\u0434\u044b /i.test(name)) {
    return /\u043c\u0430\u0441\u043a\u0430|\u0444\u0443\u043d\u043a\u0446|\u0440\u0445\u0445|\u0432\u044b\u0432\u043e\u0434/i.test(pinName);
  }
  if (/^\u0428\u0438\u0444\u0442\u0435\u0440 \u043d\u0430 |^\u041d\u0430\u0441\u043e\u0441 \u043d\u0430 |^\u041a\u043b\u0430\u043f\u0430\u043d \u043d\u0430 |^\u0420\u0435\u043b\u0435 \u043d\u0430 /i.test(name)) return true;
  if (/^\u0410\u043a\u0442\u0438\u0432\u0435\u043d /i.test(name)) {
    return /\u043c\u0435\u0442\u043e\u0434|\u0430\u043a\u0442\u0438\u0432\u0430\u0446/i.test(pinName);
  }
  if (/^\u041e\u0442 /i.test(name)) {
    return /\u0440\u0435\u0436\u0438\u043c|\u0441\u0438\u0433\u043d\u0430\u043b/i.test(pinName);
  }
  if (/^\u0412\u044b\u0441\u043e\u043a\u0438\u043c \u0443\u0440\u043e\u0432\u043d\u0435\u043c$|^\u041d\u0438\u0437\u043a\u0438\u043c \u0443\u0440\u043e\u0432\u043d\u0435\u043c$/i.test(name)) {
    return /^\u041c\u0435\u0442\u043e\u0434 \u0430\u043a\u0442\u0438\u0432\u0430\u0446\u0438\u0438$/i.test(pinName);
  }
  if (/\u0443\u0440\u043e\u0432\u043d\u0435\u043c/i.test(name)) {
    return /\u043c\u0435\u0442\u043e\u0434|\u0440\u0435\u0436\u0438\u043c/i.test(pinName);
  }
  if (/\u0432\u044b\u0432\u043e\u0434 \u042d\u0411\u0423|^\u0414\u0430\u0442\u0447\u0438\u043a /i.test(name)) {
    return /\u0432\u0445\u043e\u0434|\u0432\u044b\u0445\u043e\u0434|\u0432\u044b\u0432\u043e\u0434|\u043f\u0435\u0440\u0435\u043a\u043b\u044e\u0447/i.test(pinName);
  }
  return false;
}

function finishPinOptions(pin) {
  if (!pin || pin.kind !== "pin" || pin.optsDone) return;
  pin.optsDone = true;
  if (pin.options.length) return;
  if (pin.addr === 0x5edd) {
    pin.options = ["54-\u0439 \u0432\u044b\u0432\u043e\u0434 \u042d\u0411\u0423"];
    return;
  }
  if (/\u0432\u0445\u043e\u0434 \u042d\u0411\u0423/i.test(pin.name || "")) {
    pin.options = DEFAULT_ECU_INS.slice();
  }
}

function lastFolderName(entries) {
  var i;
  for (i = (entries || []).length - 1; i >= 0; i--) {
    if (entries[i].kind === "folder") return entries[i].name || "";
  }
  return "";
}

function isPolarityName(name) {
  return /^\u0412\u044b\u0441\u043e\u043a\u0438\u043c \u0443\u0440\u043e\u0432\u043d\u0435\u043c$|^\u041d\u0438\u0437\u043a\u0438\u043c \u0443\u0440\u043e\u0432\u043d\u0435\u043c$/i.test(name || "");
}

function lastHostPin(entries) {
  var i;
  for (i = (entries || []).length - 1; i >= 0; i--) {
    var e = entries[i];
    if (e && e.kind === "pin" && e.flagAddr && !e.zeroIsFirst) return e;
  }
  return null;
}

function isPinExtraFlag(name) {
  return /^\u041f\u0435\u0434\u0430\u043b\u044c \u0441\u0446\u0435\u043f\u043b\u0435\u043d\u0438\u044f \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0441\u044f \u0434\u043b\u044f \u043b\u0430\u0443\u043d\u0447\u0430$/i.test(name || "");
}

function attachPinExtraFlag(entries, name) {
  var host = lastHostPin(entries);
  if (!host || !host.flagAddr) return false;
  finishPinOptions(host);
  if (!host.extraFlags) host.extraFlags = [];
  host.extraFlags.push({
    name: name,
    kind: "flag",
    addr: host.flagAddr,
    bit: host.extraFlags.length,
    width: 1
  });
  return true;
}

function attachPolarity(entries, name) {
  var host = lastHostPin(entries);
  if (!host || !host.flagAddr) return false;
  finishPinOptions(host);
  var last = entries[entries.length - 1];
  if (!(last && last.kind === "pin" && last.zeroIsFirst)) {
    last = {
      name: "\u041c\u0435\u0442\u043e\u0434 \u0430\u043a\u0442\u0438\u0432\u0430\u0446\u0438\u0438",
      kind: "pin",
      nest: host.nest || 4,
      useNest: true,
      addr: host.flagAddr,
      width: 1,
      options: [],
      optsDone: true,
      zeroIsFirst: true
    };
    entries.push(last);
  }
  last.options.push(name);
  if (!host.polarity) {
    host.polarity = { addr: host.flagAddr, names: last.options, zeroIsFirst: true };
  }
  return true;
}

function isPinSectionSkip(name, folderName, pinName) {
  name = name || "";
  if (pinName && name === pinName) return true;
  if (isEcuIoTitle(name)) return true;
  if (/^\u0423\u043f\u0440\u0430\u0432\u043b\u044f\u044e\u0449\u0438\u0439 \u0432\u044b\u0445\u043e\u0434$/i.test(name)) return true;
  if (/^\u0423\u043f\u0440\u0430\u0432\u043b\u044f\u044e\u0449\u0438\u0439 \u0441\u0438\u0433\u043d\u0430\u043b$|^\u0412\u043f\u0440\u044b\u0441\u043a \u0437\u0430\u043a\u0438\u0441\u0438 \u0430\u0437\u043e\u0442\u0430$/i.test(name)) return true;
  if (/^\u041c\u0435\u0442\u043e\u0434 \u0430\u043a\u0442\u0438\u0432\u0430\u0446\u0438\u0438$|^\u041a\u043d\u043e\u043f\u043a\u0430 \u041f\u0435\u0440\u0435\u0434\u0430\u0447\u0430 \u0432\u0432\u0435\u0440\u0445$/i.test(name)) return true;
  if (/^\u041d\u043e\u0433\u0430 \u0430\u043a\u0442\u0438\u0432\u0430\u0446\u0438\u0438|^\u0422\u0438\u043f \u0430\u043a\u0442\u0438\u0432\u0430\u0446\u0438\u0438|^\u041d\u0430\u043f\u0440\u044f\u0436\u0435\u043d\u0438\u0435 \u0434\u043e\u043b\u0436\u043d\u043e/i.test(name)) return true;
  if (folderName && name === folderName) return true;
  return false;
}

function isDtvItem(n) {
  if (!n) return false;
  if (/\u0414\u0422\u0412|\u0442\u0435\u043c\u043f\u0435\u0440\u0430\u0442\u0443\u0440\u044b \u0432\u043e\u0437\u0434\u0443\u0445\u0430/i.test(n.name || "")) return true;
  var opts = n.options || [];
  var i;
  for (i = 0; i < opts.length; i++) {
    if (/\u0442\u0435\u043c\u043f\u0435\u0440\u0430\u0442\u0443\u0440\u044b \u0432\u043e\u0437\u0434\u0443\u0445\u0430/i.test(opts[i])) return true;
  }
  return false;
}

function isDadItem(n) {
  if (!n) return false;
  return /\u0414\u0410\u0414|\u0446\u0438\u043b\u0438\u043d\u0434\u0440\u043e\u0432\u044b\u0439 \u043e\u0431\u044a\u0435\u043c/i.test(n.name || "");
}

function splitFolderItems(tree, fromName, test, newName) {
  function walk(list) {
    if (!list) return;
    var i, n, keep, taken, c, re;
    re = new RegExp("^" + fromName + "$", "i");
    for (i = 0; i < list.length; i++) {
      n = list[i];
      if (n.kind === "folder" && re.test(n.name || "") && n.children) {
        keep = [];
        taken = [];
        for (c = 0; c < n.children.length; c++) {
          if (test(n.children[c])) taken.push(n.children[c]);
          else keep.push(n.children[c]);
        }
        n.children = keep;
        if (taken.length) {
          list.splice(i + 1, 0, { name: newName, kind: "folder", children: taken });
          i++;
        }
      }
      if (n.children) walk(n.children);
    }
  }
  walk(tree);
}

function isBitFolder(name) {
  return /\u0444\u043b\u0430\u0433|\u043c\u0430\u0441\u043a\u0430/i.test(name || "");
}

function skipBitName(name, folderName) {
  if (/\u0444\u043b\u0430\u0433/i.test(name || "")) return true;
  if (/\u043c\u0430\u0441\u043a\u0430|\u043e\u0448\u0438\u0431/i.test(folderName || "") && !/\d/.test(name || "")) return true;
  return false;
}

function parseFlagAddrs(buf, o, xorKey) {
  var p = o + 4;
  if (p + 4 <= buf.length && buf[p + 1] === 0xff && buf[p + 2] === 0) p += 4;
  var addrs = [];
  while (p + 4 <= buf.length) {
    var raw = u32(buf, p);
    p += 4;
    if (raw === 0) break;
    if (raw === 0xffffffff) continue;
    var a = takeAddr(buf, p - 4, xorKey);
    if (!a || a > 0xffff) break;
    addrs.push(a);
    if (addrs.length >= 16) break;
  }
  return addrs;
}

function isUnitLabel(s) {
  s = (s || "").replace(/\s+/g, " ").trim();
  if (s.length < 2 || s.length > 36) return false;
  if (/\u043c\u0433\/\u0446\u0438\u043a\u043b/i.test(s)) return true;
  if (/\u043e\u0431\.?\s*\/?\s*\u043c\u0438\u043d/i.test(s)) return true;
  if (/^\u0442\u0430\u043a\u0442/i.test(s)) return true;
  if (/\u043a\u0433\/\u0447/i.test(s)) return true;
  if (/\u043c\u0433\/\u043c\u0441\u0435\u043a/i.test(s)) return true;
  if (/^1\/\u0441\u0435\u043a/i.test(s)) return true;
  if (/^\u0438\u043c\u043f/i.test(s)) return true;
  if (/\u0441\u043a\u0432\u0430\u0436\u043d/i.test(s)) return true;
  if (/^\u0448\u0430\u0433/i.test(s)) return true;
  return /^\u0433\u0440\u0430\u0434/i.test(s)
    || /^(ALF|%|\u0441\u0435\u043a\.?|\u043c\u0441\u0435\u043a\.?|\u0446\u0438\u043a\u043b|\u043a\u043e\u044d\u0444\u0444\.?|\u043a\u041f\u0430)$/i.test(s);
}

function fillCalib(buf, o, xorKey, kind) {
  var addr = takeAddr(buf, o + 8, xorKey);
  var u = readUnit(buf, o + 16);
  var ds = readDoubles(buf, u.end, 96);
  var width = 1;
  for (var k = o + 16; k < o + 80 && k + 3 < buf.length; k++) {
    if (buf[k] === 0 && buf[k + 2] === 0xff && buf[k + 3] === 0) {
      width = buf[k + 1] === 2 ? 2 : 1;
      break;
    }
  }
  if (kind === "table") width = 1;
  var rec = { kind: kind, addr: addr, width: width, unit: u.unit, doubles: ds, rec: o };
  if (kind === "table" && typeof readTableGeom === "function") {
    var g = readTableGeom(buf, o);
    if (g) {
      rec.cols = g.cols;
      rec.zDiv = g.zDiv;
      rec.zMul = g.zMul;
      rec.zOff = g.zOff;
      if (g.xMin != null) {
        rec.mapXMin = g.xMin;
        rec.mapXMax = g.xMax;
      }
    }
    var links = typeof readAxisLinks === "function" ? readAxisLinks(buf, o, 0x1c0) : [];
    if (links.length) {
      rec.axisRef = links[0];
      rec.axisLinks = links;
    }
    if (kind === "table" && links.length >= 2 && typeof axisPointGuess === "function") {
      rec.cols = axisPointGuess(links[0]) || 16;
      rec.rows = axisPointGuess(links[1]) || 16;
    }
  }
  return rec;
}

function buildTree(entries) {
  var root = [];
  var stack = [root];
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (e.kind === "folder") {
      var nest = e.nest || 1;
      if (nest < 1) nest = 1;
      while (stack.length > nest) stack.pop();
      while (stack.length < nest) stack.push(stack[stack.length - 1]);
      var node = { name: e.name, kind: "folder", children: [], addr: e.addr };
      if (e.flagTitle) node.flagTitle = e.flagTitle;
      stack[stack.length - 1].push(node);
      stack.push(node.children);
    } else {
      if (e.useNest && e.nest) {
        var itemNest = e.nest;
        if (itemNest < 1) itemNest = 1;
        while (stack.length > itemNest) stack.pop();
        while (stack.length < itemNest) stack.push(stack[stack.length - 1]);
      }
      stack[stack.length - 1].push(e);
    }
  }
  return root;
}

var ROOT_FORCE = {
  "\u041f\u0443\u0441\u043a": 1
};

function parseMap(buf) {
  var ver = buf[3];
  var xorKey = ver === 3 ? findXorKey(buf) : 0;
  var names = collectNames(buf);
  var entries = [];
  var flagMode = false;
  var flagAddrs = [];
  var bitPos = 0;
  var flagFolder = "";
  var maskSiblingNest = 0;
  for (var i = 0; i < names.length; i++) {
    var n = names[i];
    var rec = parseRecord(buf, n.recOff, xorKey);
    if (!rec && ROOT_FORCE[n.name]) rec = { kind: "folder", nest: 1 };
    if (rec && rec.kind === "pin" && peekOutMaskBits(names, i)) {
      var mask = beginOutMask(entries, n.name, rec.addr, rec.nest, n.off);
      flagMode = mask.flagMode;
      flagAddrs = mask.flagAddrs;
      bitPos = mask.bitPos;
      flagFolder = mask.flagFolder;
      maskSiblingNest = mask.siblingNest;
      continue;
    }
    if (!rec && isEcuIoTitle(n.name)) continue;
    if (isOutMaskChild(n.name) && flagMode && flagAddrs.length) {
      var bi = bitPos++;
      var byteI = bi >> 3;
      if (byteI < flagAddrs.length) {
        entries.push({
          name: n.name,
          kind: "flag",
          addr: flagAddrs[byteI],
          bit: bi & 7,
          bitIndex: bi,
          width: 1,
          mapOff: n.off
        });
      }
      continue;
    }
    if (rec && rec.kind === "folder") {
      finishPinOptions(entries[entries.length - 1]);
      if (maskSiblingNest && rec.nest && rec.nest <= maskSiblingNest) maskSiblingNest = 0;
      rec.name = n.name;
      rec.mapOff = n.off;
      entries.push(rec);
      if (isBitFolder(n.name)) {
        flagMode = true;
        flagAddrs = parseFlagAddrs(buf, n.recOff, xorKey);
        bitPos = 0;
        flagFolder = n.name;
      } else {
        flagMode = false;
        flagFolder = "";
      }
      continue;
    }
    if (rec) {
      finishPinOptions(entries[entries.length - 1]);
      if (maskSiblingNest) {
        if (!rec.nest) rec.nest = maskSiblingNest;
        rec.useNest = true;
      }
      flagMode = false;
      flagFolder = "";
      rec.name = n.name;
      rec.mapOff = n.off;
      if (typeof applyGearMap === "function") applyGearMap(rec);
      if (typeof applyDetonationLearnMap === "function") applyDetonationLearnMap(rec);
      if (typeof applyMafCalib === "function") applyMafCalib(rec);
      entries.push(rec);
      continue;
    }
    var prev = entries[entries.length - 1];
    if (isEcuIoTitle(n.name)) continue;
    if (prev && prev.kind === "pin" && isPinSectionSkip(n.name, lastFolderName(entries), prev.name)) {
      if (/^\u041a\u043d\u043e\u043f\u043a\u0430 /i.test(n.name)) prev.flagTitle = n.name;
      if (/^\u041c\u0435\u0442\u043e\u0434 \u0430\u043a\u0442\u0438\u0432\u0430\u0446\u0438\u0438$/i.test(n.name) && prev.flagAddr) {
        prev.expectPolarity = true;
      }
      continue;
    }
    if (isPolarityName(n.name) && attachPolarity(entries, n.name)) {
      continue;
    }
    if (isPinExtraFlag(n.name) && attachPinExtraFlag(entries, n.name)) {
      continue;
    }
    if (prev && prev.kind === "pin" && !prev.optsDone && isPinChoice(n.name, prev.name)) {
      prev.options.push(n.name);
      continue;
    }
    if (prev && prev.kind === "pin") finishPinOptions(prev);
    if (prev && isUnitLabel(n.name)) {
      if (prev.kind === "table" && n.name !== prev.unit) prev.zUnit = n.name;
      else if (prev.kind === "scalar" && !prev.unit) prev.unit = n.name;
      continue;
    }
    if (flagMode && flagAddrs.length) {
      if (skipBitName(n.name, flagFolder)) {
        entries.push({ name: n.name, kind: "label", mapOff: n.off });
        continue;
      }
      var bi = bitPos++;
      var byteI = bi >> 3;
      if (byteI >= flagAddrs.length) continue;
      entries.push({
        name: n.name,
        kind: "flag",
        addr: flagAddrs[byteI],
        bit: bi & 7,
        bitIndex: bi,
        width: 1,
        mapOff: n.off
      });
    }
  }
  finishPinOptions(entries[entries.length - 1]);
  var tree = buildTree(entries);
  splitFolderItems(tree, "\u0424\u043e\u0440\u0441\u0443\u043d\u043a\u0438", isDtvItem, "\u0414\u0422\u0412");
  splitFolderItems(tree, "\u0414\u041c\u0420\u0412", isDadItem, "\u0414\u0410\u0414");
  return { ver: ver, xorKey: xorKey, entries: entries, tree: tree };
}
