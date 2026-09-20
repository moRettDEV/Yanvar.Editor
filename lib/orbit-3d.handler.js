var ORBIT_HOME = { yaw: 0.62, pitch: 0.48, zoom: 1, panX: 0, panY: 0 };

function copyOrbit(o, extra) {
  var n = {
    yaw: o.yaw,
    pitch: o.pitch,
    zoom: o.zoom,
    panX: o.panX || 0,
    panY: o.panY || 0
  };
  if (!extra) return n;
  if (extra.yaw != null) n.yaw = extra.yaw;
  if (extra.pitch != null) n.pitch = extra.pitch;
  if (extra.zoom != null) n.zoom = extra.zoom;
  if (extra.panX != null) n.panX = extra.panX;
  if (extra.panY != null) n.panY = extra.panY;
  return n;
}

function attachOrbit3d(canvas, orbit, onChange) {
  canvas._orbit = orbit || copyOrbit(ORBIT_HOME);
  canvas._onOrbit = onChange || null;
  canvas.style.cursor = canvas._onOrbit ? "grab" : "";
  if (canvas._orbitBound) return;
  canvas._orbitBound = true;
  var drag = null;

  canvas.addEventListener("auxclick", function (e) { e.preventDefault(); });
  canvas.addEventListener("mousedown", function (e) {
    if (e.button === 1) e.preventDefault();
  });
  canvas.addEventListener("pointerdown", function (e) {
    if (!canvas._onOrbit || !canvas._orbit) return;
    if (e.button !== 0 && e.button !== 1) return;
    drag = {
      mode: e.button === 1 ? "pan" : "orbit",
      x: e.clientX,
      y: e.clientY,
      yaw: canvas._orbit.yaw,
      pitch: canvas._orbit.pitch,
      panX: canvas._orbit.panX || 0,
      panY: canvas._orbit.panY || 0
    };
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = drag.mode === "pan" ? "move" : "grabbing";
    e.preventDefault();
  });

  canvas.addEventListener("pointermove", function (e) {
    if (!drag || !canvas._onOrbit) return;
    var next;
    if (drag.mode === "pan") {
      next = copyOrbit(canvas._orbit, {
        panX: drag.panX + (e.clientX - drag.x),
        panY: drag.panY + (e.clientY - drag.y)
      });
    } else {
      next = copyOrbit(canvas._orbit, {
        yaw: drag.yaw + (e.clientX - drag.x) * 0.008,
        pitch: Math.max(0.06, Math.min(1.4, drag.pitch + (e.clientY - drag.y) * 0.008))
      });
    }
    canvas._orbit = next;
    canvas._onOrbit(next);
  });

  function endDrag() {
    drag = null;
    canvas.style.cursor = canvas._onOrbit ? "grab" : "";
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  canvas.addEventListener("wheel", function (e) {
    if (!canvas._onOrbit || !canvas._orbit) return;
    e.preventDefault();
    var z = canvas._orbit.zoom * (e.deltaY > 0 ? 0.92 : 1.08);
    var next = copyOrbit(canvas._orbit, { zoom: Math.max(0.55, Math.min(2.4, z)) });
    canvas._orbit = next;
    canvas._onOrbit(next);
  }, { passive: false });

  canvas.addEventListener("dblclick", function () {
    if (!canvas._onOrbit) return;
    var next = copyOrbit(ORBIT_HOME);
    canvas._orbit = next;
    canvas._onOrbit(next);
  });
}
