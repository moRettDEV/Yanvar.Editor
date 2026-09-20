function signedToU8(s) {
  s = Math.round(s);
  if (s < -128) s = -128;
  if (s > 127) s = 127;
  return s < 0 ? s + 256 : s;
}

function invertPreset(phys, id, width) {
  var p = Number(phys);
  if (!isFinite(p)) return null;
  var w = width === 2 ? 2 : 1;
  var map = {
    raw: p,
    k256: p * 256,
    k256s: p * 256,
    k128: p * 128,
    k16: p * 16,
    k64: p * 64,
    alf: (p * 128) / 14.7,
    alf256: (p * 256) / 14.7 - 128,
    alfI8: signedToU8((p * 256) / 14.7),
    uoz: signedToU8(p * 2),
    uoz20: signedToU8(Math.max(-20, Math.min(20, p)) * 2),
    temp: (p + 40) / 5,
    half: p * 2,
    gtc: p * 3.6,
    gbc: p * 48,
    gbc1: p,
    gbc48: (p * 48) / 256,
    gbc96: (p * 96) / 256,
    gbc180: (p * 180) / 256,
    gbc90: (p * 90) / 256,
    sec: p,
    sec02: p / 0.02,
    sec2: p / 0.02,
    cycle: p,
    cycle4: p * 4,
    rpm10: p / 10,
    rpm30: p / 30,
    rpm40: p / 40,
    pct: (p * 255) / 100,
    pct255: p * 2.55,
    pct256: (p * 256) / 100,
    deg120: p,
    steps: p,
    phase6: p / 6,
    zone3: Math.max(0, Math.min(3, Math.round(p))),
    zone1: p >= 0.5 ? 1 : 0,
    zone16: p >= 0.5 ? 16 : 0,
    volt5: (p * 256) / 5,
    kOff128: p * 256 - 128,
    kgh10: p * 10 + 1000
  };
  if (!(id in map)) return null;
  return clampRaw(map[id], w);
}
