exports.handles = ["demo"];
exports.handle = function(o, tag, content) {
  var pieces = content.split("|"), type = pieces[0], path = pieces[1];
  var resourcePath = o.articleDirectory + path;
  o.resources.push(resourcePath);
  
  return '<a href="' + path + '" class = "demo">' + path + "</a>";
};