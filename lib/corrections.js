var Corrections = (function () {
  var cache = [];
  var serverOk = null;

  function keyOf(rec) {
    return rec.addr + "|" + rec.name;
  }

  function fromLs() {
    try {
      return JSON.parse(localStorage.getItem("ctp-corrections") || "[]");
    } catch (e) {
      return [];
    }
  }

  function toLs(list) {
    localStorage.setItem("ctp-corrections", JSON.stringify(list));
  }

  function merge(a, b) {
    var map = {};
    a.concat(b).forEach(function (r) {
      map[keyOf(r)] = r;
    });
    return Object.keys(map).map(function (k) { return map[k]; });
  }

  function load() {
    return fetch("/api/corrections")
      .then(function (r) {
        if (!r.ok) throw new Error("http");
        return r.json();
      })
      .then(function (list) {
        serverOk = true;
        cache = merge(fromLs(), list);
        toLs(cache);
        return flushToServer().then(function () { return cache; });
      })
      .catch(function () {
        serverOk = false;
        cache = fromLs();
        return cache;
      });
  }

  function find(name, addr) {
    var k = addr + "|" + name;
    for (var i = 0; i < cache.length; i++) {
      if (keyOf(cache[i]) === k) return cache[i];
    }
    return null;
  }

  function guessFormula(raw, ctp, doubles) {
    var d = doubles || [];
    var near = function (a, b) {
      return Math.abs(a - b) < 1e-4 || (b !== 0 && Math.abs(a - b) / Math.abs(b) < 0.002);
    };
    var fromD = typeof formulaFromDoubles === "function" ? formulaFromDoubles(d) : null;
    var tries = [
      { f: "raw", v: raw },
      { f: "raw/256", v: raw / 256 },
      { f: "raw/128", v: raw / 128 },
      { f: "raw/64", v: raw / 64 },
      { f: "raw/48", v: raw / 48 },
      { f: "raw*256/180", v: (raw * 256) / 180 },
      { f: "raw*256/90", v: (raw * 256) / 90 },
      { f: "raw/16", v: raw / 16 },
      { f: "raw/5", v: raw / 5 },
      { f: "raw/3.6", v: raw / 3.6 },
      { f: "raw/2", v: raw / 2 },
      { f: "raw*10", v: raw * 10 },
      { f: "raw*30", v: raw * 30 },
      { f: "raw*0.02", v: raw * 0.02 },
      { f: "raw*0.1", v: raw * 0.1 },
      { f: "raw*0.2", v: raw * 0.2 },
      { f: "raw*0.093", v: raw * 0.093 },
      { f: "raw*5-40", v: raw * 5 - 40 },
      { f: "raw*14.7/128", v: (raw * 14.7) / 128 },
      { f: "14.7*(raw+128)/256", v: (14.7 * (raw + 128)) / 256 },
      { f: "raw*14.7/96", v: (raw * 14.7) / 96 },
      { f: "raw*2.871094", v: raw * 2.871094 },
      { f: "raw*2.871094/256", v: (raw * 2.871094) / 256 },
      { f: "raw*100/256", v: (raw * 100) / 256 },
      { f: "raw/2.55", v: raw / 2.55 },
      { f: "raw*100/255", v: (raw * 100) / 255 },
      { f: "raw/50", v: raw / 50 },
      { f: "50/raw", v: raw ? 50 / raw : 0 }
    ];
    if (fromD) tries.unshift({ f: fromD, v: applyFormula(raw, fromD) });
    if (d[0]) {
      tries.push({ f: "raw*" + d[0], v: raw * d[0] });
      tries.push({ f: "raw/" + d[0], v: raw / d[0] });
    }
    if (d[1]) {
      tries.push({ f: "raw*" + d[1], v: raw * d[1] });
      tries.push({ f: "raw/" + d[1], v: raw / d[1] });
    }
    if (d[3] && d[2] != null) tries.push({ f: "raw*" + d[3] + "-" + d[2], v: raw * d[3] - d[2] });
    for (var i = 0; i < tries.length; i++) {
      if (near(tries[i].v, ctp)) return tries[i].f;
    }
    if (raw !== 0) {
      var k = ctp / raw;
      return "raw*" + k;
    }
    return "?";
  }

  function save(rec) {
    if (rec.zScale) rec.formulaGuess = rec.zScale;
    else if (!rec.formulaGuess) rec.formulaGuess = guessFormula(rec.raw, rec.ctpValue, rec.doubles);
    rec.savedAt = new Date().toISOString();
    var list = cache.slice();
    var i = list.findIndex(function (x) { return keyOf(x) === keyOf(rec); });
    if (i >= 0) list[i] = rec;
    else list.push(rec);
    cache = list;
    toLs(cache);

    var p = fetch("/api/correction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rec),
    })
      .then(function (r) {
        if (!r.ok) throw new Error("http");
        serverOk = true;
        return r.json();
      })
      .then(function () {
        return { ok: true, file: true, rec: rec };
      })
      .catch(function () {
        serverOk = false;
        return { ok: true, file: false, rec: rec };
      });
    return p;
  }

  function downloadBackup() {
    var blob = new Blob([JSON.stringify(cache, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "corrections.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function flushToServer() {
    if (!cache.length) return Promise.resolve({ ok: true, file: !!serverOk, count: 0 });
    return fetch("/api/corrections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cache)
    })
      .then(function (r) {
        if (!r.ok) throw new Error("http");
        serverOk = true;
        return r.json();
      })
      .then(function () {
        return { ok: true, file: true, count: cache.length };
      })
      .catch(function () {
        serverOk = false;
        return { ok: true, file: false, count: cache.length };
      });
  }

  function importList(list) {
    cache = merge(cache, list || []);
    toLs(cache);
    return flushToServer();
  }

  function all() { return cache; }
  function hasServer() { return serverOk; }

  return {
    load: load, save: save, find: find, all: all, hasServer: hasServer,
    downloadBackup: downloadBackup, flushToServer: flushToServer, importList: importList
  };
})();
