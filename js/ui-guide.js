function bindGuideResize() {
  var handle = document.getElementById("guide-resize");
  var pane = document.getElementById("guide-pane");
  if (!handle || !pane) return;
  restoreGuideWidth();
  window.addEventListener("resize", function () {
    applyGuideWidth(pane.getBoundingClientRect().width);
  });
  handle.addEventListener("mousedown", function (e) {
    e.preventDefault();
    var startX = e.clientX;
    var startW = pane.getBoundingClientRect().width;
    document.body.classList.add("guide-resizing");
    function move(ev) {
      applyGuideWidth(startW + (startX - ev.clientX));
    }
    function up() {
      document.body.classList.remove("guide-resizing");
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      persistGuideWidth();
    }
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  });
}

function bindGuide() {
  var btn = document.getElementById("guide-btn");
  var close = document.getElementById("guide-close");
  var back = document.getElementById("guide-back");
  var menu = document.getElementById("guide-menu-item");
  var frame = document.getElementById("guide-frame");
  if (btn) btn.addEventListener("click", function (e) {
    e.stopPropagation();
    toggleGuide();
  });
  if (close) close.addEventListener("click", function () { setGuideOpen(false); });
  if (back) back.addEventListener("click", guideBack);
  if (frame) frame.addEventListener("load", onGuideFrameLoad);
  if (menu) menu.addEventListener("click", toggleGuide);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isGuideOpen() && typeof isFileMenuOpen === "function" && !isFileMenuOpen()) {
      setGuideOpen(false);
    }
  });
  bindGuideResize();
  refreshGuideBack();
  var saved = false;
  try { saved = localStorage.getItem("yanvar-guide") === "1"; } catch (e) {}
  if (saved) setGuideOpen(true);
}
