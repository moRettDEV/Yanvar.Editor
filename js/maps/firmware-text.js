function firmwareHaystack(bin, name) {
  var chunks = [String(name || "")];
  if (!bin) return chunks.join(" ").toLowerCase();
  var start = -1;
  var i;
  for (i = 0; i <= bin.length; i++) {
    var ok = i < bin.length && bin[i] >= 32 && bin[i] <= 126;
    if (ok) {
      if (start < 0) start = i;
    } else if (start >= 0) {
      if (i - start >= 5) {
        chunks.push(String.fromCharCode.apply(null, Array.prototype.slice.call(bin, start, i)));
      }
      start = -1;
    }
  }
  return chunks.join(" ").toLowerCase();
}
