function setMapFamily(family) {
  if (family !== "trs" && family !== "ls" && family !== "stock") return;
  state.mapFamily = family;
  if (typeof paintMapFamily === "function") paintMapFamily();
  if (typeof persistSession === "function") persistSession();
  if (state.bin && typeof attachBundledMap === "function") attachBundledMap();
}
