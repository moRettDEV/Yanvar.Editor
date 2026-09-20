function parseAiJson(text) {
  var o = JSON.parse(text);
  if (Array.isArray(o)) return o;
  if (o && Array.isArray(o.items)) return o.items;
  if (o && (o.address || o.name || o.address_int != null)) return [o];
  throw new Error("в JSON нет items");
}
