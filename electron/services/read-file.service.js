var fs = require("fs");

function readFileBytes(filePath) {
  return fs.promises.readFile(filePath);
}

module.exports = { readFileBytes };
