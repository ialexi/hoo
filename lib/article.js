/* Helpers for the hoo worker */
var fs = require("core-support:fs"), 
    Path = require("core-support:path"),
    smartdown = require("smartdown"),
    koala = require("koala");

exports.processEmdash = function(o) {
  o.content = o.content.replace(/—/g, "&emdash;");
};

exports.processHeader = function(o) {
  // first, check if there is indeed a header
  var idx = 0, content = o.content, len = content.length, depth = 0, c, q = false, header = {};
  if (o.content[0] == "{") {
  
    while (idx < len) {
      c = content[idx];
      if (q) {
        if (c === '\\') idx++; // skip the escaped character
        else if (c === q) q = false;
      } else if (c === '{') {
        depth++;
      } else if (c === '}') {
        depth--;
      } else if (c === '"' || c === "'") {
        q = c;
      }
      idx++;
    
      // once we have left, break away
      if (depth === 0) break;
    }
  
    // now we should be able to grab content
    try {
      header = JSON.parse(content.substr(0, idx));
    } catch (e) {
      // not sure what to do here; I just know: IT FAILED!
      o.errors.push(e);
    }
  }
  
  // finally, try to find header
  // it is the entirety of the first non-blank line
  // so first, we'll find the first non-blank character
  content = content.substr(idx).replace(/^\s*|\s*$/g, "");
  var title = content.match(/^.*?$/m)[0];
  
  // apply properties found
  o.content = content;
  o.title = title;
  
  // load metadata
  if (header) {
    for (idx in header) {
      o[idx] = header[idx];
    }
  }
};

exports.processSmartdown = function(o) {
  o.content = smartdown.render(o.content);
};

exports.processDemo = function(o) {
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

exports.processes = [
  exports.processHeader,
  exports.processDemo,
  exports.processEmdash,
  exports.processSmartdown
];

exports.process = function(content, articleDirectory, outputDirectory) {
  var o = {
    content: content.replace(/^\s*|\s*$/g, ""),
    errors: [],
    demos: {},
    articleDirectory: articleDirectory,
    outputDirectory: outputDirectory
  };
  
  for (var idx = 0, len = exports.processes.length; idx < len; idx++) {
    exports.processes[idx](o);
  }

  return o;
};