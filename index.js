var db = require("zed/db");
var nlp = require("./nlp");


module.exports = function(info) {
    var path = info.path;
    var text = info.inputs.text;
    if(text.length > 10240) { // Let's not index huge files
        return;
    }
    var tokens = nlp.index(path, text);
    return db.queryIndex("fulltext", "path", ["=", path]).then(function(existingTokens) {
        return db.deleteMany("fulltext", existingTokens.map(function(t) {
            return t.id;
        }));
    }).then(function() {
        return db.putMany("fulltext", tokens);
    }).catch(function(err) {
        console.error("Fail", err);
    });
};
