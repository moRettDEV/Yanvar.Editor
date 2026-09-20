function hideCteMenu() {
  var el = document.getElementById("cte-menu");
  if (el) el.style.display = "none";
}

function pickCteFile(done) {
  var inp = document.createElement("input");
  inp.type = "file";
  inp.accept = ".cte,.CTE";
  inp.onchange = function () {
    var f = inp.files && inp.files[0];
    if (!f) return;
    f.arrayBuffer().then(function (ab) {
      done(new Uint8Array(ab), f.name);
    });
  };
  inp.click();
}

function showCteMenu(x, y, item, api) {
  var box = document.getElementById("cte-menu");
  if (!box) {
    box = document.createElement("div");
    box.id = "cte-menu";
    box.className = "cte-menu";
    document.body.appendChild(box);
    document.addEventListener("click", hideCteMenu);
    window.addEventListener("blur", hideCteMenu);
  }
  box.innerHTML = "";
  function add(lab, fn) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = lab;
    b.onclick = function (e) {
      e.stopPropagation();
      hideCteMenu();
      fn();
    };
    box.appendChild(b);
  }
  add("\u0418\u043c\u043f\u043e\u0440\u0442 CTE\u2026", function () {
    pickCteFile(function (u8, name) {
      if (typeof applyCteBuf === "function") applyCteBuf(u8, name);
    });
  });
  add("\u042d\u043a\u0441\u043f\u043e\u0440\u0442 CTE\u2026", function () {
    if (typeof exportCte === "function") {
      exportCte(item, api && api.bin, api && api.ctpText, api && api.layout);
    }
  });
  box.style.display = "block";
  var left = x;
  var top = y;
  box.style.left = left + "px";
  box.style.top = top + "px";
  var rect = box.getBoundingClientRect();
  if (rect.right > window.innerWidth) box.style.left = Math.max(8, x - rect.width) + "px";
  if (rect.bottom > window.innerHeight) box.style.top = Math.max(8, y - rect.height) + "px";
}

function attachCteMenu(el, item, api) {
  if (!el || el._cteMenu) return;
  el._cteMenu = true;
  el.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    e.stopPropagation();
    showCteMenu(e.clientX, e.clientY, item, api);
  });
}
