var smartdown = require("smartdown");
exports.process = function(o) {
  o.content = smartdown.render(o.content);
};