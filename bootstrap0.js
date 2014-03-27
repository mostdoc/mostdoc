// This is the very original bootstrap script.
(function () {
  'use strict';

  var jsdom = require("jsdom");
  var window = jsdom.jsdom().parentWindow;
  var file = process.argv.slice(-1)[0];
  var fs = require('fs');

  var tab = {};

  jsdom.env(file,
  function (errors, window) {
    var mkdep = function(dep) {
      return function () {
        return tab[dep].content.map(function (f) { return f() }).join("").replace(/\s*\n+$/,"\n").replace(/^\n+\s*/,"");
      }
    }
   var mkv = function(v) {
     return function () {
       return v;
     }
   }
   var process = function(node, current) {
     for (var c in node.childNodes) {
       var next = node.childNodes[c];
       if (next.tagName == "CODE" && next.attributes !== undefined) {
         var id = (next.attributes["md-id"] || next.attributes["md-file"]);
         if (typeof id != 'undefined') {
           var isFile = typeof next.attributes["md-file"] != 'undefined';
           id = id.textContent;
           var t = tab[id] || {};
           if (isFile) t.file = next.attributes["md-file"].textContent;
           tab[id] = t;
           process(next, id);
         } else if (typeof next.attributes["md-ref"] != 'undefined' && typeof current != 'undefined') {
           var dep = next.attributes["md-ref"].textContent;
           var dependsOn = (tab[current].dependsOn || []).concat([dep]);
           tab[current].dependsOn = dependsOn;
           tab[current].content = (tab[current].content || []).concat([mkdep(dep)]);
         }
       } else if (next.nodeName == "#text" && typeof current != 'undefined') {
         var v = next.nodeValue.replace(/\s*\n+$/,"\n").replace(/^\n+\s*/,"");
         tab[current].content = (tab[current].content || []).concat([mkv(v)]);
       }
       process(next);
     }
    }
    process(window.document);

    // console.log(tab);

    // Delete files
    for (var k in tab) {
     // Process files only
     if (typeof tab[k].file != 'undefined') {
       if (fs.existsSync(tab[k].file))
         fs.unlinkSync(tab[k].file);
     }
    }

    for (var k in tab) {
      // Process files only
      if (typeof tab[k].file != 'undefined') {
        fs.appendFileSync(tab[k].file, tab[k].content.map(function (f) { return f(); }).join(""));
      }
    }

});
}());
