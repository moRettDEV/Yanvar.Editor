function createEditHistory(limit) {
  var past = [];
  var future = [];
  limit = limit || 80;
  return {
    push: function (state) {
      past.push(state);
      if (past.length > limit) past.shift();
      future.length = 0;
    },
    undo: function (current) {
      if (!past.length) return null;
      future.push(current);
      return past.pop();
    },
    redo: function (current) {
      if (!future.length) return null;
      past.push(current);
      return future.pop();
    }
  };
}
