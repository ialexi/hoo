var fs = require("core-support:fs");

exports.resourcesFromSection = function(section, state) {
  var articles = section.articles;
  for (var article = 0, len = articles.length; article < len; article++) {
    exports.resourcesFromArticle(articles[article], state);
  }
};

exports.resourcesFromArticle = function(article, state) {
  var a = state.outputDirectory + article + ".json";
  try {
    a = JSON.parse(fs.readFile(a));
  } catch(e) {
    a = {resources: []};
  }
  
  for (var ri = 0, len = a.resources.length; ri < len; ri++) {
    state.resources.push(a.resources[ri]);
  }
};

exports.process = function(contents, settings) {
  // function to loop through articles, read them in, and process.
  
  try {
    var res = JSON.parse(contents);
    res.outputDirectory = settings.outputDirectory;
    res.relativeDirectory = settings.relativeDirectory;
    res.packageName = settings.packageName;
    res.resources = [];
    
    // find resources
    for (var section = 0, len = res.sections.length; section < len; section++) {
      exports.resourcesFromSection(res.sections[section], res);
    }
    
    // process resources; ones without : need the package name added, for instance...
    var resources = res.resources, rlen = resources.length, ri;
    for (ri = 0; ri < rlen; ri++) {
      resources[ri] = settings.resourcePath(resources[ri]);
    }
    
    return res;
  } catch (e) {
    return { "error": e };
  }
};

/*
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
*/