var smartdown = require("smartdown"), fs = require("core_support:fs"), 
    spawn = require("spawn"), sys = require("sys"), Path = require("core_support:path");

exports.doctor = function(opts, done) {
  var start = new Date().getTime();
  
  var outputDirectory = opts.output;
  if (outputDirectory[outputDirectory.length - 1] != "/") outputDirectory += "/";
  
  fs.glob(opts.input, /.*\.md/, function(err, paths) {
    var queue = [];
    var total = 0, processed = 0;
    for (var idx = 0, len = paths.length; idx < len; idx++) {
      queue.push({
        "input": "src/" + paths[idx],
        "output": outputDirectory + paths[idx].replace(".md", ".html"),
        "cwd": Path.dirname(paths[idx]) + "/"
      });
      total++;
    }
    
    spawn.manage(module.pkg.path + "/bin/hoo-worker", [opts.template], queue, function(result) {
      processed++;
      if (opts.progress) opts.progress({ processed: processed, total: total });
    })
    
    (function() {
      if (opts.resources) {
        fs.cp_r(opts.resources, outputDirectory, function() {

        });
      }
      
      var time = (new Date().getTime()) - start;
      done({
        processed: processed,
        total: total,
        time: time
      })
    });
  });
  
};