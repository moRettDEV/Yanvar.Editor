function isFileMenuOpen() {
  var menu = document.getElementById("file-menu");
  return !!(menu && !menu.hidden);
}

function closeFileMenu() {
  var menu = document.getElementById("file-menu");
  var btn = document.getElementById("file-menu-btn");
  if (menu) menu.hidden = true;
  if (btn) btn.setAttribute("aria-expanded", "false");
}

function openFileMenu() {
  var menu = document.getElementById("file-menu");
  var btn = document.getElementById("file-menu-btn");
  if (menu) menu.hidden = false;
  if (btn) btn.setAttribute("aria-expanded", "true");
}

function toggleFileMenu() {
  if (isFileMenuOpen()) closeFileMenu();
  else openFileMenu();
}

function bindFileMenu() {
  var btn = document.getElementById("file-menu-btn");
  var menu = document.getElementById("file-menu");
  if (!btn || !menu) return;
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    toggleFileMenu();
  });
  menu.addEventListener("click", function (e) {
    e.stopPropagation();
    var item = e.target && e.target.closest ? e.target.closest(".file-menu-item") : null;
    if (item) closeFileMenu();
  });
  document.addEventListener("click", function () { closeFileMenu(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeFileMenu();
  });
}
