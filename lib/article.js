/* Helpers for the hoo worker */
exports.processes = [
  require("./article-processors/articleHeader"),
//  require("./article-processors/demo"),
  require("./article-processors/emdash"),
  require("./article-processors/smartdown"),
  require("./article-processors/handler")
];

exports.process = function(content, articleDirectory, outputDirectory) {
  var o = {
    content: content.replace(/^\s*|\s*$/g, ""),
    errors: [],
    resources: [],
    articleDirectory: articleDirectory,
    outputDirectory: outputDirectory
  };
  
  for (var idx = 0, len = exports.processes.length; idx < len; idx++) {
    exports.processes[idx].process(o);
  }

  return o;
};