
exports.process = function(o) {
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
