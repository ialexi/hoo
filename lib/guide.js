var fs = require("core-support:fs");

exports.process = function(contents, relativeDirectory, inputDirectory, outputDirectory) {
  var processArticles = function(articles) {
    var idx, len = articles.length, a;
    for (idx = 0; idx < len; idx++) {
      a = outputDirectory + articles[idx] + ".json";
      try {
        a = JSON.parse(fs.readFile(a));
      } catch(e) {
        a = {"error": e, file: a};
      }
      articles[idx] = a;
    }
    return articles;
  };
  
  var processSections = function(sections) {
    var idx, len = sections.length, section;
    for (idx = 0; idx < len; idx++) {
      section = sections[idx];
      if (section.articles) section.articles = processArticles(section.articles);
    }
    return sections;
  };
  
  try {
    var res = JSON.parse(contents);
    
    if (res.sections) res.sections = processSections(res.sections);
    
    return res;
  } catch (e) {
    return { "error": e };
  }
};