function hideItemMenu() {
  var el = document.getElementById("item-menu");
  if (el) el.style.display = "none";
}

function showItemMenu(x, y, item, api) {
  var box = document.getElementById("item-menu");
  if (!box) {
    box = document.createElement("div");
    box.id = "item-menu";
    box.className = "cte-menu";
    document.body.appendChild(box);
    document.addEventListener("click", hideItemMenu);
    window.addEventListener("blur", hideItemMenu);
  }
  box.innerHTML = "";
  function add(lab, fn) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = lab;
    b.onclick = function (e) {
      e.stopPropagation();
      hideItemMenu();
      fn();
    };
    box.appendChild(b);
  }
  if (item && item.kind !== "label") {
    add("Экспорт для ИИ…", function () {
      if (typeof selectNode === "function") selectNode(item);
      if (typeof openAiExport === "function") openAiExport();
    });
  }
  if (item && item.kind === "table") {
    add("Импорт CTE…", function () {
      pickCteFile(function (u8, name) {
        if (typeof applyCteBuf === "function") applyCteBuf(u8, name);
      });
    });
    add("Экспорт CTE…", function () {
      if (typeof exportCte === "function") {
        exportCte(item, api && api.bin, api && api.ctpText, api && api.layout);
      }
    });
  }
  if (typeof hasCompare === "function" && hasCompare() && item) {
    if (item.kind === "folder") {
      add("Скопировать отличия из сравниваемой", function () {
        var n = copyCompareFolder(item);
        if (typeof setStatus === "function") setStatus("из сравниваемой → " + n + " параметров");
        if (typeof selectNode === "function") selectNode(item);
        if (typeof refreshCompareUi === "function") refreshCompareUi();
      });
    } else if (item.kind === "table") {
      add("Скопировать таблицу из сравниваемой", function () {
        copyCompareItem(item);
        if (typeof selectNode === "function") selectNode(item);
        if (typeof refreshCompareUi === "function") refreshCompareUi();
      });
      var ids = api && api.getSelected ? api.getSelected() : [];
      if (ids && ids.length) {
        add("Скопировать выделение (" + ids.length + ") из сравниваемой", function () {
          copyCompareCells(item, ids);
          if (typeof selectNode === "function") selectNode(item);
          if (typeof refreshCompareUi === "function") refreshCompareUi();
        });
      }
      if (api && api.cellIndex != null) {
        add("Скопировать ячейку из сравниваемой", function () {
          copyCompareCells(item, [api.cellIndex]);
          if (typeof selectNode === "function") selectNode(item);
          if (typeof refreshCompareUi === "function") refreshCompareUi();
        });
      }
    } else if (item.addr != null) {
      add("Скопировать из сравниваемой", function () {
        copyCompareItem(item);
        if (typeof selectNode === "function") selectNode(item);
        if (typeof refreshCompareUi === "function") refreshCompareUi();
      });
    }
  }
  if (!box.childNodes.length) return;
  box.style.display = "block";
  box.style.left = x + "px";
  box.style.top = y + "px";
  var rect = box.getBoundingClientRect();
  if (rect.right > window.innerWidth) box.style.left = Math.max(8, x - rect.width) + "px";
  if (rect.bottom > window.innerHeight) box.style.top = Math.max(8, y - rect.height) + "px";
}

function attachItemMenu(el, item, api) {
  if (!el || el._itemMenu) return;
  el._itemMenu = true;
  el.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var td = e.target && e.target.closest ? e.target.closest("td[data-i]") : null;
    var next = api || {};
    next.cellIndex = td ? Number(td.getAttribute("data-i")) : null;
    showItemMenu(e.clientX, e.clientY, item, next);
  });
}
