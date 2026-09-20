function loadBundledMap(file) {
  return fetch("maps/" + encodeURIComponent(file)).then(function (r) {
    if (!r.ok) throw new Error(file);
    return r.arrayBuffer();
  }).then(function (ab) {
    openMap(new Uint8Array(ab), file);
  }).catch(function () {
    if (typeof setStatus === "function") setStatus("нет карты " + file);
    if (typeof refreshOpenHint === "function") refreshOpenHint();
  });
}
