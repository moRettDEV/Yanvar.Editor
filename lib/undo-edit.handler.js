var EditUndo = {
  api: null,
  bind: function (api) { this.api = api; },
  unbind: function () { this.api = null; }
};

document.addEventListener("keydown", function (e) {
  if (!(e.ctrlKey || e.metaKey)) return;
  var z = e.code === "KeyZ" || e.key === "z" || e.key === "Z";
  var y = e.code === "KeyY" || e.key === "y" || e.key === "Y";
  if (!z && !y) return;
  var t = e.target;
  if (t && (t.isContentEditable || t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
  if (!EditUndo.api) return;
  e.preventDefault();
  if (y || (z && e.shiftKey)) {
    if (EditUndo.api.redo) EditUndo.api.redo();
  } else if (EditUndo.api.undo) {
    EditUndo.api.undo();
  }
});
