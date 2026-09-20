var SessionFiles = (function () {
  var DB = "bin-editor";
  var STORE = "files";

  function openDb() {
    return new Promise(function (res, rej) {
      var req = indexedDB.open(DB, 1);
      req.onupgradeneeded = function () {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = function () { res(req.result); };
      req.onerror = function () { rej(req.error); };
    });
  }

  function save(payload) {
    return openDb().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(payload, "last");
        tx.oncomplete = function () { res(); };
        tx.onerror = function () { rej(tx.error); };
      });
    }).catch(function () {});
  }

  function load() {
    return openDb().then(function (db) {
      return new Promise(function (res, rej) {
        var q = db.transaction(STORE, "readonly").objectStore(STORE).get("last");
        q.onsuccess = function () { res(q.result || null); };
        q.onerror = function () { rej(q.error); };
      });
    }).catch(function () { return null; });
  }

  return { save: save, load: load };
})();
