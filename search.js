var ui = require("zed/ui");
var db = require("zed/db");
var session = require("zed/session");
var nlp = require("./nlp");

module.exports = function(info) {
    var matches, phrase;
    return ui.prompt("Word to look for", "").then(function(phrase_) {
        if (!phrase_) {
            throw Error("done");
        }
        phrase = phrase_.toLowerCase();
        return db.query("fulltext", [">=", phrase, "<=", phrase + db.lastChar]);
    }).then(function(matches_) {
        matches = matches_;
        return session.goto("zed::search");
    }).then(function() {
        session.setText("zed::search", "Searching for '" + phrase + "'...\nPut your cursor on the result press Enter to jump.\n");
        matches = matches.slice(0, 1000);
        matches.forEach(function(match) {
            append("\n" + match.path + ":" + (match.row + 1) + "\n\t" + match.line + "\n");
        });
        if (matches.length === 0) {
            append("\nNo results found.");
        } else {
            append("\nFound " + matches.length + " results.");
        }
    }).
    catch (function(err) {
        if (err.message !== "done") {
            console.error("Got error", err);
            append("\nGot error: " + err.message);
            throw err;
        }
    });
};


function append(text) {
    session.append("zed::search", text);
}
