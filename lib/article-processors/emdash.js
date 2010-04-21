
exports.process = function(o) {
  o.content = o.content.replace(/—/g, "&emdash;");
};
