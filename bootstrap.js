(function () {
  'use strict';

  var InputDocument = function(doc) {
  this._doc = (doc || window.document);
};
InputDocument.prototype.doc = function() {
  return this._doc;
};InputDocument.prototype.fragments = function() {
  return $(this.doc()).find("code[md-id],code[md-file]");
};InputDocument.prototype.files = function() {
  return $(this.doc()).find("code[md-file]").map(function(i, e) {
    return $(e).attr('md-file');
  }).toArray();
};InputDocument.prototype.produce = function(file) {
  var _doc = this.doc();
  var processFragment = function(e) {
    var fragment = new CodeFragment(e);
    var result = [];
    fragment.data().forEach(function(d) {
      if (typeof d == 'string') {
        result.push(d);
      } else if (typeof d == 'object') {
        if (typeof d.reference != 'undefined') {
          $(_doc).find("code[md-id=\"" + d.reference + "\"]").each(function (i, e1) {
            result = result.concat(processFragment(e1));
          });
        }
      }
    });
    return result.join("");
  }
  var acc = "";
  $(_doc).find("code[md-file=\"" + file + "\"]").each(function(i, e) {
   acc += processFragment(e);
  });
  return acc;
};
  var CodeFragment = function(node) {
  if (typeof node.get == 'undefined')
    this._node = node
  else
    this._node = node.get(0);
};
CodeFragment.prototype.node = function() {
  return this._node;
};
CodeFragment.prototype.element = function() {
  return $(this.node());
};    CodeFragment.prototype.name = function() {
      return (this.element().attr("md-id") || this.element().attr("md-file"));
    };      CodeFragment.prototype.file = function() {
        return (this.element().attr("md-file") || false);
      };    CodeFragment.prototype.lang = function() {
      return this.element().attr("md-lang");
    };CodeFragment.prototype.data = function() {
  var acc = [];
  var childNodes = this.node().childNodes;
  for (var i in childNodes) {
    var node = childNodes[i];
    if (node.nodeType == Node.TEXT_NODE) {
  acc.push($(node).text());
}if (node.nodeType == Node.ELEMENT_NODE && node.tagName == 'CODE') {
  var dep = {reference: $(node).attr("md-ref")};
  acc.push(dep);
}
  }  if (acc.length > 0) {
    var first_text, last_text;
for (var i in acc) {
  if (typeof acc[i] == 'string') {
    first_text = i;
    break;
  }
}
for (var i in acc) {
  if (typeof acc[acc.length - 1 - i] == 'string') {
    last_text = acc.length - 1 - i;
    break;
  }
}
if (typeof first_text != 'undefined')
  acc[first_text] = acc[first_text].replace(/^\s*\n/,"");
if (typeof last_text != 'undefined')
  acc[last_text] = acc[last_text].replace(/\s*$/,"");
  }
  return acc;
};

  var parseInputDocument = function(doc) {
  var dfd = q.defer();
  var jsdom = require("jsdom");
  jsdom.env(doc, {SkipExternalResources: true}, function (errors, window) {
    GLOBAL.$ = require('jquery')(window);
    GLOBAL.Node = GLOBAL.Node || {
      ELEMENT_NODE: 1,
      ATTRIBUTE_NODE: 2,
      TEXT_NODE: 3
    };
    var input_doc = new InputDocument(window.document);
    dfd.resolve(input_doc, window);
  });
  return dfd.promise;
};
  if (typeof require != 'undefined' && require.main === module) {
  var q = require('q');  var fs = require('fs');    var file = process.argv.slice(-1)[0];    parseInputDocument(file)  .then(function(doc, window) {
    var files = doc.files();
    for (var i in files) {
      var file = files[i];
      fs.writeFileSync(file, doc.produce(file));
    }
    window.close()
  })};


}());