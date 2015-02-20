var db = require("zed/db");
var fs = require("zed/fs");
var session = require("zed/session");
var nlp = require("./nlp");


module.exports = function(info) {
    var allFiles;
    var path = info.path;


    session.flashMessage(path, "Starting reindex");
    return Promise.all([clean(), fs.listFilesOfKnownFileTypes()]).then(function(results) {
        allFiles = results[1].filter(function(path) {
            return path[0] === '/';
        });
        return indexOne();
    }).then(function() {
        session.flashMessage(path, "Done!");
        console.log("Done!");
    });

    function clean() {
        return db.getAll("fulltext").then(function(all) {
            return db.deleteMany("fulltext", all.map(function(entry) {
                return entry.id;
            }));
        });
    }

    function indexOne() {
        var path = allFiles.pop();
        console.log("Now full-text indexing", path);
        return fs.readFile(path).then(function(text) {
            if (text.length > 10240) { // Let's not index huge files
                return;
            }
            var tokens = nlp.index(path, text);
            return db.putMany("fulltext", tokens);
        }).then(function() {
            if(allFiles.length > 0) {
                return indexOne();
            }
        });
    }
};
