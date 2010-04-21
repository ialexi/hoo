exports.handlers = [
  require("./handlers/comment"),
  require("./handlers/demo")
];
var sys = require("sys");

exports.process = function(o) {
  var handlers = {};

  // take the handler names from the handlers and put them in the hash
  for (var i = 0, len = exports.handlers.length; i<len; i++) {
    var h = exports.handlers[i].handles;
    for (var hi = 0, hl = h.length; hi < hl; hi++) {
      handlers[h[hi]] = exports.handlers[i];
    }
  }
    
  var input = o.content;
  o.content = input.replace(/\{\{(.*?):(.*?)\}\}/g, function(r, tag, content){
    if (handlers[tag]) return handlers[tag].handle(o, tag, content);
    else return "TAG: " + tag + " " + content + " " + r;
  });
};