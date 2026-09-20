(function () {
  var viewerLab = "\u0432\u044c\u044e\u0435\u0440";
  var tipLead = /^(CTP|\u0432\u044c\u044e\u0435\u0440)\s+/;

  function shortLab(s) {
    s = String(s || "").replace(/^.*[\\/]/, "");
    return s.length > 18 ? s.slice(0, 17) + "\u2026" : s;
  }

  function comparing(opts) {
    return typeof hasCompare === "function" && hasCompare() &&
      opts && opts.overlay && opts.overlay.length;
  }

  if (typeof drawCtp2d === "function") {
    var draw = drawCtp2d;
    drawCtp2d = function (canvas, bytes, rows, cols, item, opts) {
      opts = Object.assign({}, opts || {});
      var cmp = comparing(opts);
      if (!cmp && !opts.keepOverlay && !(typeof isMafCalib === "function" && isMafCalib(item))) {
        delete opts.overlay;
      }
      var proto = CanvasRenderingContext2D.prototype;
      var fillText = proto.fillText;
      var fillRect = proto.fillRect;
      var oldB = typeof PLOT_BLUE !== "undefined" ? PLOT_BLUE : null;
      var oldG = typeof PLOT_GREEN !== "undefined" ? PLOT_GREEN : null;
      if (cmp) {
        PLOT_BLUE = "#c4b5fd";
        PLOT_GREEN = "#2dd4bf";
      }
      proto.fillRect = function (x, y, w, h) {
        if (w === 10 && h === 10 && !cmp) return;
        return fillRect.apply(this, arguments);
      };
      proto.fillText = function (text) {
        var s = String(text == null ? "" : text);
        if (s === viewerLab) {
          if (!cmp) return;
          return fillText.call(this, shortLab(typeof plotFileLabel === "function" ? plotFileLabel("cur") : "эта"), arguments[1], arguments[2]);
        }
        if (s === "CTP") {
          if (!cmp) return;
          return fillText.call(this, shortLab(typeof plotFileLabel === "function" ? plotFileLabel("cmp") : "та"), arguments[1], arguments[2]);
        }
        return fillText.apply(this, arguments);
      };
      try {
        return draw(canvas, bytes, rows, cols, item, opts);
      } finally {
        proto.fillText = fillText;
        proto.fillRect = fillRect;
        if (oldB != null) PLOT_BLUE = oldB;
        if (oldG != null) PLOT_GREEN = oldG;
      }
    };
  }

  if (typeof attachPlotHover === "function") {
    var hover = attachPlotHover;
    attachPlotHover = function (canvas, onSet, onEnd) {
      var first = !canvas._plotBound;
      hover(canvas, onSet, onEnd);
      if (!first) return;
      var move = canvas.onmousemove;
      canvas.onmousemove = function (e) {
        if (move) move.call(this, e);
        var host = canvas.parentElement;
        var tip = host && host.querySelector(".plot-tip");
        if (!tip || !tip.textContent) return;
        var t = tip.textContent;
        if (typeof hasCompare === "function" && hasCompare()) {
          t = t.replace(/^CTP\s+/, plotFileLabel("cmp") + "  ");
          t = t.replace(/^\u0432\u044c\u044e\u0435\u0440\s+/, plotFileLabel("cur") + "  ");
        } else {
          t = t.replace(tipLead, "");
        }
        tip.textContent = t;
      };
    };
  }
})();
