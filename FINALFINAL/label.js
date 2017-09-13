// Doing stuff with a database in Node.js

// Table was created with:
// CREATE TABLE PhotoLabels (fileName TEXT UNIQUE NOT NULL PRIMARY KEY, labels TEXT, favorite INTEGER)

var sqlite3 = require("sqlite3").verbose(); // use sqlite
var dbFile = "photos.db"
var db = new sqlite3.Database(dbFile); // new object, old DB


// SERVER CODE
// Handle request to add a label
var querystring = require('querystring'); // handy for parsing query strings

function answer(query, response) {
  // query looks like: op=add&img=[image filename]&label=[label to add]
  queryObj = querystring.parse(query);
  console.log("THIS IS OP" + queryObj.op);
  if (queryObj.op == "add") {
    var newLabel = queryObj.label;
    var imageFile = queryObj.img;
    var apiOn = queryObj.api;
    if (newLabel && imageFile) {
      // good add query
      // go to database!
      db.get(
        'SELECT labels FROM photoLabels WHERE fileName = ?', [imageFile], getCallback);

      // define callback inside queries so it knows about imageFile
      // because closure!
      function getCallback(err, data) {
        console.log("getting add labels from " + imageFile);
        if (err) {
          console.log("error: ", err, "\n");
        } else {
          // good response...so let's update labels
          if ("undefined" === typeof data) {
            console.log("upadting label error");
          } else {
            db.run(
              'UPDATE photoLabels SET labels = ? WHERE fileName = ?', [newLabel + "| " + data.labels, imageFile],
              updateCallback);
          }
        }
      }

      // Also define this inside queries so it knows about
      // response object
      function updateCallback(err) {
        console.log("updating labels for " + imageFile + "\n");
        if (apiOn == "on") {
          return;
        } else {
          if (err) {
            console.log(err + "\n");
            sendCode(400, response, "requested photo not found");
          } else {
            // send a nice response back to browser

            response.status(200);
            response.type("text/plain");
            response.send("added label " + newLabel + " to " + imageFile);

          }
        }
      }

    }
  } else if (queryObj.op == "del") {
    var tag = queryObj.tag;
    var filename = queryObj.img;
    if (tag && filename) {
      db.get(
        'SELECT labels FROM photoLabels WHERE fileName = ?', [filename], getCallback2);

      // define callback inside queries so it knows about imageFile
      // because closure!
      function getCallback2(err, data) {
        console.log("getting delete labels from " + filename);
        if (err) {
          console.log("error: ", err, "\n");
        } else {
          // good response...so let's update labels
          console.log('UPDATE photoLabels SET labels =REPLACE(labels, ', '"', tag, '"', ', "") ');
          db.run(
            'UPDATE photoLabels SET labels =REPLACE(labels, ' + '"' + tag + '"' + ', "") WHERE filename = ?', filename,
            updateCallback2);
        }
      }

      // Also define this inside queries so it knows about
      // response object
      function updateCallback2(err) {
        console.log("updating labels for " + filename + "\n");
        if (err) {
          console.log(err + "\n");
          sendCode(400, response, "requested photo not found");
        } else {
          // send a nice response back to browser
          response.status(200);
          response.type("text/plain");
          response.send("delted label " + tag + " from " + filename);
        }
      }

    }

  }


}

exports.answer = answer;
