(function () {
  var SHOW = "\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0440\u0430\u0437\u0434\u0435\u043b\u044b";
  var HIDE = "\u0421\u043a\u0440\u044b\u0442\u044c \u0440\u0430\u0437\u0434\u0435\u043b\u044b";
  var PLACE = "\u041f\u043e\u0438\u0441\u043a \u043f\u043e \u0432\u0441\u0435\u043c \u0441\u0442\u0430\u0442\u044c\u044f\u043c";
  var EMPTY = "\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e";
  var FOUND = "\u041d\u0430\u0439\u0434\u0435\u043d\u043e";
  var ON = "\u043d\u0430";
  var PAGES = "\u0441\u0442\u0440.";

  var toc = document.getElementById("toc");
  var toggle = document.getElementById("tocToggle");
  if (toggle && toc) {
    toggle.addEventListener("click", function () {
      toc.classList.toggle("open");
      toggle.textContent = toc.classList.contains("open") ? HIDE : SHOW;
    });
  }

  var links = Array.prototype.slice.call(document.querySelectorAll(".toc ol a"));
  var nodes = links
    .map(function (a) { return document.getElementById((a.getAttribute("href") || "").slice(1)); })
    .filter(Boolean);

  function setActive() {
    if (!nodes.length) return;
    var current = nodes[0].id;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].getBoundingClientRect().top <= 90) current = nodes[i].id;
    }
    links.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  document.addEventListener("scroll", setActive, { passive: true });
  setActive();

  function ensureSearchBox() {
    var existing = document.getElementById("siteSearch");
    if (existing) return existing;
    if (!toc) return null;
    var box = document.createElement("div");
    box.className = "search-box";
    box.innerHTML = '<input type="search" id="siteSearch" autocomplete="off" spellcheck="false">' +
      '<div id="searchPanel" class="search-panel" hidden></div>';
    var brand = toc.querySelector(".toc-brand");
    if (brand && brand.nextSibling) toc.insertBefore(box, brand.nextSibling);
    else toc.insertBefore(box, toc.firstChild);
    return document.getElementById("siteSearch");
  }

  var input = ensureSearchBox();
  var panel = document.getElementById("searchPanel");
  if (input) input.placeholder = PLACE;

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/\u0451/g, "\u0435")
      .replace(/[^a-z0-9\u0400-\u04ff]+/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function mark(text, tokens) {
    var out = esc(text);
    tokens.forEach(function (t) {
      if (t.length < 2) return;
      var re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }

  function snippet(text, tokens) {
    var n = norm(text);
    var pos = -1;
    for (var i = 0; i < tokens.length; i++) {
      pos = n.indexOf(tokens[i]);
      if (pos >= 0) break;
    }
    if (pos < 0) pos = 0;
    var from = Math.max(0, pos - 36);
    var raw = text.substring(from, Math.min(text.length, from + 140));
    if (from > 0) raw = "\u2026" + raw;
    if (from + 140 < text.length) raw += "\u2026";
    return mark(raw.replace(/\s+/g, " "), tokens);
  }

  function hrefTo(item) {
    var here = document.documentElement.getAttribute("data-folder") || "";
    var hash = item.id ? "#" + item.id : "";
    if (!here || here === item.folder) return encodeURI(item.file) + hash;
    return encodeURI("../" + item.folder + "/" + item.file) + hash;
  }

  var active = -1;
  var lastHits = [];

  function render(query) {
    if (!panel) return;
    var q = norm(query);
    if (q.length < 2 || !window.SEARCH_INDEX) {
      panel.hidden = true;
      panel.innerHTML = "";
      lastHits = [];
      return;
    }
    var tokens = q.split(" ").filter(function (t) { return t.length > 1; });
    if (!tokens.length) {
      panel.hidden = true;
      return;
    }

    var hits = [];
    window.SEARCH_INDEX.forEach(function (item) {
      var hay = item.ntext;
      var ok = tokens.every(function (t) { return hay.indexOf(t) !== -1; });
      if (!ok) return;
      var score = 0;
      if (item.ntext.indexOf(q) !== -1) score += 40;
      tokens.forEach(function (t) {
        if (item.ntitle.indexOf(t) !== -1) score += 20;
        if (item.nhead.indexOf(t) !== -1) score += 12;
        score += 3;
      });
      hits.push({ item: item, score: score });
    });
    hits.sort(function (a, b) { return b.score - a.score; });

    var seen = {};
    hits = hits.filter(function (h) {
      var key = h.item.file + "#" + (h.item.id || "") + "|" + h.item.text;
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });

    var headingOnly = {};
    hits.forEach(function (h) {
      var k = h.item.file + "#" + (h.item.id || "");
      if (h.item.text !== h.item.head) headingOnly[k] = true;
    });
    hits = hits.filter(function (h) {
      if (h.item.text !== h.item.head) return true;
      return !headingOnly[h.item.file + "#" + (h.item.id || "")];
    });

    var hereFile = decodeURIComponent((location.pathname || "").split("/").pop() || "");
    hits.sort(function (a, b) {
      var aHere = a.item.file === hereFile ? 0 : 1;
      var bHere = b.item.file === hereFile ? 0 : 1;
      if (aHere !== bHere) return aHere - bHere;
      if (a.item.page !== b.item.page) return a.item.page < b.item.page ? -1 : 1;
      return b.score - a.score;
    });

    var total = hits.length;
    var shown = hits.slice(0, 80);
    lastHits = shown;

    if (!shown.length) {
      panel.hidden = false;
      panel.innerHTML = '<div class="search-empty">' + EMPTY + "</div>";
      return;
    }

    var pages = {};
    shown.forEach(function (h) { pages[h.item.page] = true; });
    var html = '<div class="search-meta">' + FOUND + " " + total + " " + ON + " " + Object.keys(pages).length + " " + PAGES;
    if (total > shown.length) html += " \u00b7 " + shown.length;
    html += "</div>";
    var curPage = "";
    shown.forEach(function (h, idx) {
      var it = h.item;
      if (it.page !== curPage) {
        if (curPage) html += "</div>";
        curPage = it.page;
        html += '<div class="search-group"><h3>' + esc(it.page) + "</h3>";
      }
      html += '<a class="search-hit" data-i="' + idx + '" href="' + hrefTo(it) + '">';
      if (it.head && it.head !== it.page) html += "<small>" + mark(it.head, tokens) + "</small>";
      html += "<q>" + snippet(it.text, tokens) + "</q></a>";
    });
    if (curPage) html += "</div>";
    panel.hidden = false;
    panel.innerHTML = html;
    active = -1;
  }

  function go(i) {
    if (!lastHits[i]) return;
    var it = lastHits[i].item;
    try { sessionStorage.setItem("trsSearch", input.value); } catch (e) {}
    location.href = hrefTo(it);
  }

  if (input && panel) {
    var timer = null;
    input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () { render(input.value); }, 120);
    });
    input.addEventListener("keydown", function (e) {
      var items = panel.querySelectorAll(".search-hit");
      if (e.key === "Escape") {
        input.value = "";
        render("");
        input.blur();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        active = Math.min(items.length - 1, active + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        active = Math.max(0, active - 1);
      } else if (e.key === "Enter" && lastHits.length) {
        e.preventDefault();
        go(active >= 0 ? active : 0);
        return;
      } else {
        return;
      }
      items.forEach(function (el, i) { el.classList.toggle("is-active", i === active); });
      if (items[active]) items[active].scrollIntoView({ block: "nearest" });
    });
    panel.addEventListener("click", function (e) {
      var a = e.target.closest(".search-hit");
      if (!a) return;
      e.preventDefault();
      go(parseInt(a.getAttribute("data-i"), 10));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== input && !/input|textarea/i.test(document.activeElement.tagName)) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });
    document.addEventListener("click", function (e) {
      if (e.target.closest(".mob-bar") || e.target.closest(".toc")) return;
      if (!panel.hidden && !e.target.closest(".search-box")) {
        panel.hidden = true;
      }
    });
  }

  function flashTarget() {
    var id = decodeURIComponent((location.hash || "").replace("#", ""));
    var el = id && document.getElementById(id);
    if (!el) return;
    el.classList.add("flash-hit");
    try {
      var q = sessionStorage.getItem("trsSearch");
      if (q) {
        var tokens = norm(q).split(" ").filter(function (t) { return t.length > 1; });
        var walk = el.querySelectorAll("p, h2, h3, li, figcaption, b");
        if (!walk.length) walk = [el];
        Array.prototype.forEach.call(walk, function (node) {
          if (node.querySelector("mark")) return;
          var txt = node.textContent || "";
          if (tokens.every(function (t) { return norm(txt).indexOf(t) !== -1; })) {
            node.innerHTML = mark(txt, tokens);
          }
        });
      }
    } catch (e) {}
    el.scrollIntoView({ block: "center" });
  }
  if (location.hash) setTimeout(flashTarget, 60);

  var SEARCH_L = "\u041f\u043e\u0438\u0441\u043a";
  var TOC_L = "\u041e\u0433\u043b\u0430\u0432\u043b\u0435\u043d\u0438\u0435";
  var PAGES_L = "\u0421\u0442\u0430\u0442\u044c\u0438";
  var NO_TOC = "\u041d\u0430 \u044d\u0442\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u043d\u0435\u0442 \u0440\u0430\u0437\u0434\u0435\u043b\u043e\u0432";
  var SERIES_L = "\u0420\u0430\u0437\u0434\u0435\u043b\u044b";
  var T_ALL = "\u0413\u043b\u0430\u0432\u043d\u0430\u044f";
  var T_FLAGS = "\u0424\u043b\u0430\u0433\u0438 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442\u0430\u0446\u0438\u0438";
  var T_START = "\u0420\u0435\u0436\u0438\u043c \u041f\u0443\u0441\u043a";
  var T_IDLE = "\u041f\u0435\u0440\u0435\u0445\u043e\u0434 / \u0425\u043e\u043b\u043e\u0441\u0442\u043e\u0439 \u0445\u043e\u0434";
  var T_FIRM = "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043f\u0440\u043e\u0448\u0438\u0432\u043a\u0438";
  var T_INJ = "Injector Online";
  var T_J5 = "J5LS V43A";
  var T_GUIDE = "\u041e\u0442 \u041e\u041b\u0422 \u0434\u043e \u0431\u043b\u043e\u043a\u0430 \u043a\u043b\u0438\u0435\u043d\u0442\u0430";
  var T_HW = "\u0416\u0435\u043b\u0435\u0437\u043e \u0438 \u041e\u041b\u0422";
  var T_OLT = "J5 / J7 Online";
  var T_CTP = "CTP 3.21";
  var RELOAD_L = "\u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c";
  var RESET_L = "\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u0433\u0430\u043b\u043e\u0447\u043a\u0438";

  function icon(kind) {
    if (kind === "search") return '<svg viewBox="0 0 25 25"><circle cx="11" cy="11" r="6.25"/><path d="M16.2 16.2L22 22"/></svg>';
    if (kind === "toc") return '<svg viewBox="0 0 25 25"><path d="M4 7.5h17M4 12.5h17M4 17.5h12"/></svg>';
    if (kind === "reload") return '<svg viewBox="0 0 25 25"><path d="M20.5 12.5a8 8 0 1 1-2.2-5.6"/><path d="M20.5 4.5v6h-6"/></svg>';
    return '<svg viewBox="0 0 25 25"><path d="M6.5 5.5h9l3.5 3.5v12H6.5z"/><path d="M9.5 11.5h6M9.5 15.5h6"/></svg>';
  }

  function wrapPane(nodes, cls, title) {
    var pane = document.createElement("div");
    pane.className = "toc-pane " + cls;
    if (title) {
      var h = document.createElement("div");
      h.className = "pane-title";
      h.textContent = title;
      pane.appendChild(h);
    }
    nodes.forEach(function (n) { if (n) pane.appendChild(n); });
    return pane;
  }

  function pageHref(item) {
    var here = document.documentElement.getAttribute("data-folder") || "";
    if (!here || here === item.folder) return encodeURI(item.file);
    return encodeURI("../" + item.folder + "/" + item.file);
  }

  function shortTitle(it) {
    var f = it.file || "";
    var p = (it.page || it.title || "").toLowerCase();
    if (f === "index.html") return T_ALL;
    if (f === "setup.html") return T_GUIDE;
    if (f === "hw.html") return T_HW;
    if (f === "ctp.html") return T_CTP;
    if (f === "olt.html") return T_OLT;
    if (f === "setup-trs-dmrv.html") return "TRS \u00b7 \u0414\u041c\u0420\u0412";
    if (f === "setup-trs-dad.html") return "TRS \u00b7 \u0414\u0410\u0414";
    if (f === "setup-trs-turbo.html") return "TRS \u00b7 \u0442\u0443\u0440\u0431\u043e";
    if (f === "setup-ls-dmrv.html") return "LS \u00b7 \u0414\u041c\u0420\u0412";
    if (f === "setup-ls-dad.html") return "LS \u00b7 \u0414\u0410\u0414";
    if (f === "setup-ls-turbo.html") return "LS \u00b7 \u0442\u0443\u0440\u0431\u043e";
    if (f.indexOf("InjOnl") >= 0) return T_INJ;
    if (f.toLowerCase().indexOf("j5ls") >= 0) return T_J5;
    if (p.indexOf("\u0444\u043b\u0430\u0433") >= 0) return T_FLAGS;
    if (p.indexOf("\u043f\u0443\u0441\u043a") >= 0) return T_START;
    if (p.indexOf("\u0445\u043e\u043b\u043e\u0441\u0442") >= 0 || p.indexOf("\u043f\u0435\u0440\u0435\u0445\u043e\u0434") >= 0) return T_IDLE;
    return T_FIRM;
  }

  function pageRank(p) {
    if (p.file === "index.html") return 0;
    if (p.file === "setup.html" || p.title === T_GUIDE) return 1;
    if (p.file.indexOf("setup-") === 0) return 2;
    if (p.file === "ctp.html" || p.title === T_CTP) return 3;
    if (p.file === "olt.html" || p.title === T_OLT) return 4;
    if (p.file === "hw.html" || p.title === T_HW) return 5;
    var t = p.title;
    if (t === T_FLAGS) return 6;
    if (t === T_START) return 7;
    if (t === T_IDLE) return 8;
    if (t === T_FIRM) return 9;
    if (p.file.indexOf("InjOnl") >= 0) return 10;
    if (p.file.toLowerCase().indexOf("j5ls") >= 0) return 11;
    return 11;
  }

  function collectPages() {
    var seen = {};
    var list = [];
    var hereFolder = document.documentElement.getAttribute("data-folder") || "site";
    list.push({ folder: hereFolder, file: "index.html", title: T_ALL });
    seen[hereFolder + "/index.html"] = true;
    (window.SEARCH_INDEX || []).forEach(function (it) {
      if (it.file === "index.html" || /TRS249/.test(it.file)) return;
      var k = it.folder + "/" + it.file;
      if (seen[k]) return;
      seen[k] = true;
      list.push({ folder: it.folder, file: it.file, title: shortTitle(it) });
    });
    if (!list.length) {
      document.querySelectorAll(".series a, .cards a").forEach(function (a) {
        var href = a.getAttribute("href") || "";
        if (!href || href.indexOf("#") === 0) return;
        var parts = href.replace(/^\.\.\//, "").split("/");
        var file = decodeURIComponent(parts.pop() || "");
        var folder = parts.length ? decodeURIComponent(parts.join("/")) : (document.documentElement.getAttribute("data-folder") || "");
        var k = folder + "/" + file;
        if (seen[k] || !file) return;
        seen[k] = true;
        list.push({ folder: folder, file: file, title: a.textContent.trim() || file });
      });
    }
    list.sort(function (a, b) { return pageRank(a) - pageRank(b); });
    return list;
  }

  function fillSeries(box) {
    if (!box) return;
    var hereFile = decodeURIComponent((location.pathname || "").split("/").pop() || "");
    box.innerHTML = "";
    var brand = document.createElement("div");
    brand.className = "toc-brand";
    brand.textContent = SERIES_L;
    box.appendChild(brand);
    collectPages().forEach(function (p) {
      var a = document.createElement("a");
      a.href = pageHref(p);
      a.textContent = p.title;
      if (p.file === hereFile) a.className = "current";
      box.appendChild(a);
    });
  }

  function setupMobile() {
    var vp = document.querySelector('meta[name="viewport"]');
    if (vp && vp.content.indexOf("viewport-fit") < 0) {
      vp.content = "width=device-width, initial-scale=1, viewport-fit=cover";
    }
    if (!document.querySelector('meta[name="theme-color"]')) {
      var theme = document.createElement("meta");
      theme.name = "theme-color";
      theme.media = "(max-width: 980px)";
      theme.content = "#000000";
      document.head.appendChild(theme);
    }
    if (!toc) return;
    if (!window.matchMedia("(max-width: 980px)").matches) return;
    var searchBox = toc.querySelector(".search-box");
    var tocH2 = toc.querySelector("h2");
    var tocBtn = document.getElementById("tocToggle");
    var tocOl = toc.querySelector("ol");
    var series = toc.querySelector(".series");

    if (searchBox && !searchBox.closest(".toc-pane")) {
      toc.appendChild(wrapPane([searchBox], "pane-search", SEARCH_L));
    }
    if (!toc.querySelector(".pane-toc")) {
      var tocNodes = [];
      if (tocOl && tocOl.children.length) tocNodes.push(tocOl);
      else {
        var empty = document.createElement("p");
        empty.className = "search-empty";
        empty.textContent = NO_TOC;
        tocNodes.push(empty);
      }
      toc.appendChild(wrapPane(tocNodes, "pane-toc", TOC_L));
    }
    var seriesBox = series;
    if (!seriesBox) {
      seriesBox = document.createElement("div");
      seriesBox.className = "series";
      toc.appendChild(seriesBox);
    }
    fillSeries(seriesBox);
    if (!toc.querySelector(".pane-pages")) {
      toc.appendChild(wrapPane([seriesBox], "pane-pages", PAGES_L));
    }

    if (toc.parentNode !== document.body) {
      document.body.appendChild(toc);
    }
    if (!document.querySelector(".mob-back")) {
      var back = document.createElement("div");
      back.className = "mob-back";
      back.addEventListener("click", closeSheet);
      document.body.appendChild(back);
    }
    if (!document.querySelector(".mob-bar")) {
      var bar = document.createElement("nav");
      bar.className = "mob-bar";
      bar.innerHTML =
        '<button type="button" data-sheet="search">' + icon("search") + "<span>" + SEARCH_L + "</span></button>" +
        '<button type="button" data-sheet="toc">' + icon("toc") + "<span>" + TOC_L + "</span></button>" +
        '<button type="button" data-sheet="pages">' + icon("pages") + "<span>" + PAGES_L + "</span></button>" +
        '<button type="button" data-act="reload">' + icon("reload") + "<span>" + RELOAD_L + "</span></button>";
      bar.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn) return;
        if (btn.getAttribute("data-act") === "reload") {
          location.reload();
          return;
        }
        toggleSheet(btn.getAttribute("data-sheet"));
      });
      document.body.appendChild(bar);
    }
  }

  function closeSheet() {
    document.body.classList.remove("sheet-open", "sheet-search", "sheet-toc", "sheet-pages");
    document.querySelectorAll(".mob-bar button").forEach(function (b) { b.classList.remove("is-on"); });
  }

  function toggleSheet(name) {
    var on = document.body.classList.contains("sheet-" + name);
    closeSheet();
    if (on) return;
    document.body.classList.add("sheet-open", "sheet-" + name);
    var btn = document.querySelector('.mob-bar button[data-sheet="' + name + '"]');
    if (btn) btn.classList.add("is-on");
    if (name === "search" && input) {
      setTimeout(function () { input.focus(); }, 80);
    }
  }

  setupMobile();

  (function bindChecks() {
    var all = document.querySelectorAll("input[data-check]");
    if (!all.length) return;
    var key = "trsChecks:" + decodeURIComponent((location.pathname.split("/").pop() || "setup"));
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch (e) {}
    function paint() {
      var on = 0;
      Array.prototype.forEach.call(all, function (inp) {
        if (inp.checked) on++;
      });
      var bar = document.getElementById("checkProgress");
      if (bar) bar.textContent = on + " / " + all.length;
    }
    Array.prototype.forEach.call(all, function (inp) {
      inp.checked = !!saved[inp.getAttribute("data-check")];
      inp.addEventListener("change", function () {
        saved[inp.getAttribute("data-check")] = inp.checked;
        try { localStorage.setItem(key, JSON.stringify(saved)); } catch (e) {}
        paint();
      });
    });
    var reset = document.getElementById("checkReset");
    if (reset) {
      reset.textContent = RESET_L;
      reset.addEventListener("click", function () {
        saved = {};
        try { localStorage.removeItem(key); } catch (e) {}
        Array.prototype.forEach.call(all, function (inp) { inp.checked = false; });
        paint();
      });
    }
    paint();
  })();

  var zoomImgs = Array.prototype.slice.call(document.querySelectorAll("article img, .page figure img"));
  var zoomI = -1;
  var zoomLock = 0;
  var zoom = document.createElement("div");
  zoom.className = "zoom";
  zoom.innerHTML = '<button type="button" class="zoom-close" aria-label="Close">&times;</button>' +
    '<button type="button" class="zoom-nav zoom-prev" aria-label="Prev">&#8249;</button>' +
    '<img alt="">' +
    '<button type="button" class="zoom-nav zoom-next" aria-label="Next">&#8250;</button>' +
    '<div class="zoom-tools"><button type="button" class="zoom-z" data-z="-1">\u2212</button>' +
    '<button type="button" class="zoom-z" data-z="1">+</button></div>' +
    '<div class="zoom-cap"></div>';
  document.body.appendChild(zoom);
  var zoomPic = zoom.querySelector("img");
  var zoomCap = zoom.querySelector(".zoom-cap");
  var zScale = 1;
  var zX = 0;
  var zY = 0;
  var pinch0 = 0;
  var panX = 0;
  var panY = 0;
  var lastTap = 0;
  var swipeX = 0;
  var didPinch = false;

  function applyView() {
    zoomPic.style.transform = "translate(" + zX + "px," + zY + "px) scale(" + zScale + ")";
  }
  function resetView() {
    zScale = 1;
    zX = 0;
    zY = 0;
    applyView();
  }
  function bumpScale(dir) {
    zScale = Math.min(5, Math.max(1, zScale + dir * 0.4));
    if (zScale === 1) { zX = 0; zY = 0; }
    applyView();
    zoomLock = Date.now();
  }
  function touchDist(a, b) {
    var dx = a.clientX - b.clientX;
    var dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function showZoom(i) {
    if (!zoomImgs.length) return;
    zoomI = (i + zoomImgs.length) % zoomImgs.length;
    var src = zoomImgs[zoomI];
    zoomPic.src = src.currentSrc || src.src;
    var cap = "";
    var fig = src.closest("figure");
    if (fig) {
      var fc = fig.querySelector("figcaption");
      if (fc) cap = fc.textContent;
    }
    if (!cap) cap = src.alt || "";
    zoomCap.textContent = cap;
    var many = zoomImgs.length > 1;
    zoom.querySelector(".zoom-prev").hidden = !many;
    zoom.querySelector(".zoom-next").hidden = !many;
    resetView();
    zoomLock = Date.now();
    document.body.classList.add("zoom-open");
    closeSheet();
  }
  function hideZoom() {
    if (Date.now() - zoomLock < 450) return;
    document.body.classList.remove("zoom-open");
    zoomPic.removeAttribute("src");
    resetView();
    zoomI = -1;
  }

  zoomImgs.forEach(function (img, i) {
    img.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      showZoom(i);
    });
    img.addEventListener("touchend", function (e) {
      if (e.cancelable) e.preventDefault();
      showZoom(i);
    }, { passive: false });
  });
  zoom.addEventListener("click", function (e) {
    if (Date.now() - zoomLock < 450) return;
    var zbtn = e.target.closest(".zoom-z");
    if (zbtn) {
      bumpScale(parseInt(zbtn.getAttribute("data-z"), 10));
      return;
    }
    if (e.target.classList.contains("zoom-prev")) showZoom(zoomI - 1);
    else if (e.target.classList.contains("zoom-next")) showZoom(zoomI + 1);
    else if (e.target === zoomPic && zScale > 1.05) return;
    else hideZoom();
  });
  zoom.addEventListener("touchstart", function (e) {
    if (e.touches.length === 2) {
      pinch0 = touchDist(e.touches[0], e.touches[1]);
      didPinch = true;
      zoomLock = Date.now();
    } else if (e.touches.length === 1) {
      swipeX = e.touches[0].clientX;
      panX = e.touches[0].clientX;
      panY = e.touches[0].clientY;
    }
  }, { passive: false });
  zoom.addEventListener("touchmove", function (e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      var d = touchDist(e.touches[0], e.touches[1]);
      if (pinch0) {
        zScale = Math.min(5, Math.max(1, zScale * (d / pinch0)));
        pinch0 = d;
        if (zScale === 1) { zX = 0; zY = 0; }
        applyView();
      }
      didPinch = true;
      zoomLock = Date.now();
    } else if (e.touches.length === 1 && zScale > 1.05) {
      e.preventDefault();
      zX += e.touches[0].clientX - panX;
      zY += e.touches[0].clientY - panY;
      panX = e.touches[0].clientX;
      panY = e.touches[0].clientY;
      applyView();
      didPinch = true;
    }
  }, { passive: false });
  zoom.addEventListener("touchend", function (e) {
    if (e.touches.length === 0 && e.target === zoomPic) {
      var now = Date.now();
      if (now - lastTap < 280) {
        if (zScale > 1.2) resetView();
        else { zScale = 2.2; applyView(); }
        zoomLock = Date.now();
        didPinch = true;
      }
      lastTap = now;
    }
    if (e.touches.length) return;
    if (didPinch) {
      didPinch = false;
      pinch0 = 0;
      return;
    }
    var dx = (e.changedTouches[0] && e.changedTouches[0].clientX) - swipeX;
    if (zScale <= 1.05 && Math.abs(dx) > 50 && zoomImgs.length > 1) {
      zoomLock = Date.now();
      showZoom(zoomI + (dx < 0 ? 1 : -1));
    }
    pinch0 = 0;
  }, { passive: true });

  document.addEventListener("keydown", function (e) {
    if (document.body.classList.contains("zoom-open")) {
      if (e.key === "Escape") hideZoom();
      else if (e.key === "ArrowLeft") showZoom(zoomI - 1);
      else if (e.key === "ArrowRight") showZoom(zoomI + 1);
      return;
    }
    if (e.key === "Escape" && document.body.classList.contains("sheet-open")) {
      closeSheet();
    }
  });
})();
