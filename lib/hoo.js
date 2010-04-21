/*globals global*/

global.DEBUG = false;

var smartdown = require("smartdown"), fs = require("core-support:fs");

var spawn = require("spawn"), sys = require("sys"), 
    Path = require("core-support:path");

exports.doctor = function(opts, doctorHasFinished) {
  var outputDirectory = opts.output, inputDirectory = opts.input, packageName = opts.packageName;
  if (outputDirectory[outputDirectory.length - 1] !== "/") outputDirectory += "/";
  if (inputDirectory[inputDirectory.length - 1] !== "/") inputDirectory += "/";
  var progress = {
    total: 0,
    processed: 0,
    start: new Date().getTime()
  };

  // calls the callback with the found paths  
  var getArticles = function(done) {
    fs.glob(opts.input, /.*\.md$/, function(err, paths){
      done(paths);
    });
  };

  // calls the callback with the found paths
  var getGuides = function(done) {
    fs.glob(opts.input, /.*\.guide$/, function(err, paths){
      done(paths);
    });
  };

  // copies the input directory to the output directory
  var copyInputDirectory = function(done) {
    fs.cp_r(opts.input, opts.output, done);
  };
  
  // copies the resources folder to the right place
  var copyGeneratedResources = function(done) {
    if (opts.resources) fs.cp_r(opts.resources, outputDirectory, done);
  };
  
  var createQueue = function(paths, done) {
    var queue = [];
    
    // generate the queue
    for (var idx = 0, len = paths.length; idx < len; idx++) {
      var extension = paths[idx].match(/\.([^\.]+)$/, "")[1];
      queue.push({ "input": inputDirectory + paths[idx],
        "type": extension,
        "output":  outputDirectory + paths[idx].replace(/\.[^\.]+$/, ""), //get rid of extension entirely; it will add back.
        "cwd": Path.dirname(paths[idx]) + "/",
        "inputDirectory": inputDirectory,
        "outputDirectory": outputDirectory,
        "packageName": packageName
      });
      progress.total++;
    }
    done(queue);
  };
  
  var spawnWorkers = function(queue, done) {
    spawn.manage(module.ownerPackage.path + "/bin/hoo-worker", [opts.template], queue, function(result) {
      progress.processed++;
      if (opts.progress) opts.progress({ processed: progress.processed, total: progress.total });
    })(function() {
      progress.end = new Date().getTime();
      progress.time = progress.end - progress.start;
      done(progress); 
    });
  };
  
  
  // now, for the REAL logic.
  // first, remove output directory
  if (fs.exists(opts.output)) fs.rm_r(opts.output);
  
  var processGuides = function() {
    getGuides(function(paths) {
      createQueue(paths, function(queue){
        spawnWorkers(queue, function(){
          doctorHasFinished(progress);
        });
      });
    });
  };
  
  var processPaths = function(articlePaths, guidePaths) {
    createQueue(articlePaths, function(queue){
      spawnWorkers(queue, function() {
        
        createQueue(guidePaths, function(queue){
          spawnWorkers(queue, function() {
            
            doctorHasFinished(progress);
            
          });
        });
        
      });
    });
  };
  
  var loadPaths = function() {
    getArticles(function(articlePaths) {
      getGuides(function(guidePaths) {
        processPaths(articlePaths, guidePaths);
      });
    });
  };
  
  // start the chain reaction
  copyInputDirectory(loadPaths);
};
