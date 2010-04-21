var koala = require("koala"),
    fs = require("core-support:fs");

exports.process = function(o) {
  // {{demo:sc|touch-demo.js}}
  o.content = o.content.replace(/\{\{demo\:sc\|(.*?)\}\}/g, function(a, m) {
    try {
      var code = fs.readFile(o.outputDirectory + o.articleDirectory + m);
      o.demos[m] = {
        ex: code,
        highlighted: koala.render(".js", code),
        original: code
      };
    } catch(e) {
      o.demos[m] = { "error": e };
    }
    return "<a href='" + m + "' class='demo'>" + m + "</a>";
  });
};