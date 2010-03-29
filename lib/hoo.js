/*globals global*/
global.DEBUG = false;
var smartdown = require("smartdown"), fs = require("core_support:fs"), 
    spawn = require("spawn"), sys = require("sys"), 
    Path = require("core_support:path");
    
var fixPath = function(opts) {
  if (global.DEBUG) sys.puts("Entered fixPath:");
  var outputDirectory = opts.output;
  if (outputDirectory[outputDirectory.length - 1] !== "/") outputDirectory += "/";
  return outputDirectory;
};
 
var notifyProgress = function(err, progress, done) {
  if (err) throw err;
  if (global.DEBUG) sys.puts("Entered notifyProgress:");
  if (progress) {
    var time = new Date().getTime() - progress.start;
    var results = { processed: progress.processed, total: progress.total, time: time };
    done(results);
  }
};
    
var loadQueue = function(err, paths, opts, done, start) {
  return function(complete) {
    if (err) return complete(err);
    if (global.DEBUG) sys.puts("Entered loadQueue:");
    var outputDirectory = fixPath(opts), queue = [], total = 0, processed = 0;
    for (var idx = 0, len = paths.length; idx < len; idx++) {
      queue.push({ "input": "src/" + paths[idx],
        "output":  outputDirectory + paths[idx].replace(".md", ".html"),
        "cwd": Path.dirname(paths[idx]) + "/"
      });
      total++;
    }
    var progress = {start: start, total: total, processed: processed};
    return complete(null, opts, queue, progress, done);
  };
};
 
var spawnWorkers = function(err, opts, queue, progress, done) {
  return function(complete) {
    if (err) return complete(err);
    if (global.DEBUG) sys.puts("Entered spawnWorkers:");
    var outputDirectory = fixPath(opts);
    spawn.manage(module.pkg.path + "/bin/hoo-worker", [opts.template], queue, function(result) {
      progress.processed++;
      if (opts.progress) opts.progress({ processed: progress.processed, total: progress.total });
    })(function() {
      complete(null, opts, outputDirectory, progress, done)(notifyProgress); 
    });
  };
};
 
var copyGeneratedResources = function(err, opts, outputDirectory, progress, done) {
  return function(complete) {
    if (err) return complete(err);
    if (global.DEBUG) sys.puts("Entered copyGeneratedResources:");
    if (opts.resources) fs.cp_r(opts.resources, outputDirectory, function() {});
    return complete(null, progress, done);
  };
};
 
exports.doctor = function(opts, done) {
  var start = new Date().getTime();
  if (fs.exists(opts.output)) fs.rm_r(opts.output);
  fs.cp_r(opts.input, opts.output, function(){
    fs.glob(opts.input, /.*\.md/, function(err, paths){
      loadQueue(err, paths, opts, done, start)(spawnWorkers)(copyGeneratedResources);
    });
  });
};