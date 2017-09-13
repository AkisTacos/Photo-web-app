/* This server, unlike our previous ones, uses the express framework */
var express = require('express');
var formidable = require('formidable'); // we upload images in forms
// this is good for parsing forms and reading in the images
var sqlite3 = require("sqlite3").verbose(); // use sqlite

// make a new express server object
var app = express();
var label = require("./label");
var querystring = require('querystring');
var LIVE = true;
var request = require('request');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


function errorCallback(err) {
  if (err) {
    console.log("error: ", err, "\n");
  }
}

function dataCallback(err, tableData) {
  if (err) {
    console.log("error: ", err, "\n");
  } else {
    console.log("got: ", tableData, "\n");
  }
}




// Now we build a pipeline for processing incoming HTTP requests

// Case 1: static files
app.use(express.static('public')); // serve static files from public
// if this succeeds, exits, and rest of the pipeline does not get done

// Case 2: queries
// An example query URL is "138.68.25.50:???/query?img=hula"
app.get('/query', function(request, response) {
  console.log("query");
  query = request.url.split("?")[1]; // get query string
  console.log(query);
  if (query[0] == "o" && query[1] == "p") {
    label.answer(query, response);
  } else if (query[0] == "t" && query[1] == "a" && query[2] == "g") {
    answer2(query, response);
  } else if (query[0] == "g" && query[1] == "p" && query[2] == "e") {
    answer3(query, response);
  } else if (query[0] == "f" && query[1] == "o" && query[2] == "p") {
    answer4(query, response);
  } else if (query[0] == "f" && query[1] == "a" && query[2] == "d") {
    answer5(query, response);
  } else if (query) {
    answer1(query, response);
  } else {
    sendCode(400, response, 'query not recognized');
  }
});

//Case 2.5 label


// Case 3: upload images
// Responds to any POST request
app.post('/', function(req, response) {
  var url = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCed8rPNBMEB3hvgGLfgWpVgTPlT0ZX67M';
  var form = new formidable.IncomingForm();
  var dbFile = "photos.db"
  var db = new sqlite3.Database(dbFile); // new object, old DB
  var filePath = "";
  var upFileName = "";

  form.parse(req); // figures out what files are in form

  // callback for when a file begins to be processed
  form.on('fileBegin', function(name, file) {
    // put it in /public

    //if((file.type == "image/jpeg)| file.type == "))
    //else {console.log cannot upload + file.typer}

    file.path = __dirname + '/public/uploads/' + file.name;
    console.log("uploading ", file.name, name);
    filePath = "http://138.68.25.50:12029/uploads/" + file.name;
    upFileName = file.name;



    db.serialize(function() {

      console.log("starting DB operations");

      // Insert or replace rows into the table
      db.run(
        'INSERT OR REPLACE INTO photoLabels VALUES ("' + file.name + '", "", 0)',
        errorCallback);

      // Changing data - the UPDATE statement
      // db.run(
      //   'UPDATE photoLabels SET labels = "" WHERE fileName = "" ',
      //   errorCallback);

      // db.get(
      //   'SELECT labels FROM photoLabels WHERE fileName = ?', ["hula.jpg"], dataCallback);
      //

      /* Some more examples of database commands you could try

          // Dump whole database
          // db.all('SELECT * FROM photoLabels',dataCallback);

          // fill-in-the-blanks syntax for Update command
          db.run(
      	'UPDATE photoLabels SET labels = ? WHERE fileName = ? ',
      	['Bird, Beak, Bird Of Prey, Eagle, Vertebrate, Bald Eagle, Fauna, Accipitriformes, Wing', 'eagle.jpg'],errorCallback);

          db.run(
      	'UPDATE photoLabels SET labels = ? WHERE fileName = ? ',
      	[ 'Habitat, Vegetation, Natural Environment, Woodland, Tree, Forest, Green, Ecosystem, Rainforest, Old Growth Forest', 'redwoods.jpg'],errorCallback);

          // Getting all rows where a substring of the "labels" field
          // matches the string "Bird"
          db.all(
      	'SELECT * FROM photoLabels WHERE labels LIKE  ?',
      	["%Bird%"],dataCallback);
      */

      db.close();

      // You need to uncomment the line below when you uncomment the call
      // to db.serialize
    });



  });

  form.on('progress', function(bytesReceived, bytesExpected) {

  });

  // callback for when file is fully recieved
  form.on('end', function() {
    console.log('success');
    sendCode(201, response, 'recieved file'); // respond to browser

    requestObject = {
      "requests": [{
        "image": {
          "source": {
            "imageUri": filePath
          }
        },
        "features": [{
          "type": "LABEL_DETECTION"
        }]
      }]
    }

    function annotateImage() {
      if (LIVE) {
        // The code that makes a request to the API
        // Uses the Node request module, which packs up and sends off
        // an XMLHttpRequest.
        request({ // HTTP header stuff
            url: url,
            method: "POST",
            headers: {
              "content-type": "application/json"
            },
            // stringifies object and puts into HTTP request body as JSON
            json: requestObject,
          },
          // callback function for API request
          APIcallback
        );
      } else { // not live! return fake response
        // call fake callback in 2 seconds
        console.log("not live");
        setTimeout(fakeAPIcallback, 2000);
      }
    }


    // live callback function
    function APIcallback(err, APIresponse, body) {
      var stringLabel = "";
      if ((err) || (APIresponse.statusCode != 200)) {
        console.log("Got API error");
      } else {
        APIresponseJSON = body.responses[0];
        if (!APIresponseJSON) {
          console.log("Got API error");
        } else {
          for (var i = 0, len = APIresponseJSON.labelAnnotations.length; i < len; i++) {
            if (i < 10) {
              console.log(APIresponseJSON.labelAnnotations[i].description);
              stringLabel += APIresponseJSON.labelAnnotations[i].description + " |";
              console.log("strong of labels: " + stringLabel)
            }
          }
          stringQuery = 'op=add&api=on&img=' + upFileName + '&label=' + stringLabel;
          label.answer(stringQuery, response);
        }
      }
    }

    // fake callback function
    function fakeAPIcallback() {
      console.log("fake");

      console.log(` { labelAnnotations:    [ { mid: '/m/026bk', description: 'fakeLabel1', score: 0.89219457 },
         { mid: '/m/05qjc',
           description: 'fakeLabel2',
           score: 0.87477195 },
         { mid: '/m/06ntj', description: 'fakeLabel3', score: 0.7928342 },
         { mid: '/m/02jjt',
           description: 'fakeLabel4',
           score: 0.7739482 },
         { mid: '/m/02_5v2',
           description: 'fakeLabel5',
           score: 0.70231736 } ] }`);
    }







    annotateImage();
  });

});

// You know what this is, right?
app.listen(12029);

// sends off an HTTP response with the given status code and message
function sendCode(code, response, message) {
  response.status(code);
  response.send(message);
}

// Stuff for dummy query answering
// We'll replace this with a real database someday!
function answer1(query, response) {
  var dbFile = "photos.db"
  var db2 = new sqlite3.Database(dbFile); // new object, old DB

  db2.serialize(function() {

    console.log("starting DB operations");
    console.log("answering");
    db2.all('SELECT * FROM photoLabels LIMIT 10 OFFSET (SELECT count(*) FROM photoLabels)-10', dataCallback);
    // db2.all('SELECT fileName FROM photoLabels WHERE ROWNUM <= 10', dataCallback);

    function dataCallback(err, data) {
      console.log("getting FileNames");
      if (err) {
        console.log("error: ", err, "\n");
      } else {
        // good response...so let's update labels
        if (data[(query - 1)]) {
          // console.log(JSON.stringify(data));
          response.status(200);
          response.type("text/json");
          response.send(data[(query - 1)]);
        } else {
          sendCode(400, response, "requested photo not found");
        }
      }
    }


    //  console.log(query);
    //  console.log(dataCallback);

    // Insert or replace rows into the table

    db2.close();


    // You need to uncomment the line below when you uncomment the call
    // to db.serialize
  });



}

function answer2(query, response) {
  var dbFile = "photos.db"
  var db2 = new sqlite3.Database(dbFile); // new object, old DB


  queryObj = querystring.parse(query);
  var tagNum = queryObj.tag;
  var tagN = queryObj.tagN;


  db2.serialize(function() {

    console.log("starting DB operations");
    console.log("answering");
    db2.all('SELECT * FROM photoLabels WHERE fileName = ?', [tagN], dataCallback);


    function dataCallback(err, data) {
      console.log("getting tags");
      if (err) {
        console.log("error: ", err, "\n");
      } else {
        // good response...so let's update labels
        if (data) {
          if ("undefined" === typeof data[0]) {
            sendCode(400, response, "requested tag not found");
          } else {

            console.log(JSON.stringify(data));
            console.log(data[0].labels);
            response.status(200);
            response.type("text/JSON");
            response.send(data[0].labels);
          }
        } else {
          sendCode(400, response, "requested tag not found");
        }
      }
    }


    console.log(tagNum);
    console.log(dataCallback);

    // Insert or replace rows into the table

    db2.close();


    // You need to uncomment the line below when you uncomment the call
    // to db.serialize
  });



}

function answer3(qry, response) {
  var dbFile = "photos.db"
  var db2 = new sqlite3.Database(dbFile); // new object, old DB


  queryObj = querystring.parse(qry);
  var filterQ = queryObj.filter;
  var fav = queryObj.type;


  db2.serialize(function() {

    console.log("starting DB operations");
    console.log("answering");
    if (fav == "fav") {
      db2.all('SELECT * FROM photoLabels WHERE favorite LIKE "%1%"', dataCallback2);

      function dataCallback2(err, data) {
        console.log("getting fav images");
        if (err) {
          console.log("error: ", err, "\n");
        } else {
          // good response...so let's update labels
          if (data) {
            if (data[0].fileName) {
              console.log("^^^^^^^^^^^^^^^^^^^^^^^");
              console.log(JSON.stringify(data));
              console.log(data[0].fileName);
              response.status(200);
              response.type("text/JSON");
              response.send(data);
            } else {
              sendCode(400, response, "requested img not found");
            }
          } else {
            sendCode(400, response, "requested img not found");
          }
        }
      }
    } else {
      db2.all('SELECT * FROM photoLabels WHERE labels LIKE "%' + filterQ + '%"', dataCallback);

      function dataCallback(err, data) {
        console.log("getting filtered images");
        if (err) {
          console.log("error: ", err, "\n");
        } else {
          // good response...so let's update labels
          if (data) {
            if (data[0].fileName) {
              console.log("^^^^^^^^^^^^^^^^^^^^^^^");
              console.log(JSON.stringify(data));
              console.log(data[0].fileName);
              response.status(200);
              response.type("text/JSON");
              response.send(data);
            } else {
              sendCode(400, response, "requested tag not found");
            }
          } else {
            sendCode(400, response, "requested tag not found");
          }
        }
      }
    }





    // Insert or replace rows into the table

    db2.close();


    // You need to uncomment the line below when you uncomment the call
    // to db.serialize
  });



}

function answer4(query, response) { //change fav
  var dbFile = "photos.db"
  var db2 = new sqlite3.Database(dbFile); // new object, old DB


  queryObj = querystring.parse(query);
  var img = queryObj.img;



  db2.serialize(function() {

    console.log("starting DB operations");
    console.log("answering FAV");
    db2.all('SELECT * FROM photoLabels WHERE fileName = ?', [img], dataCallback);
    console.log("LOKKII HERE" + img);

    function dataCallback(err, data) {
      console.log("getting fav");
      if (err) {
        console.log("error: ", err, "\n");
      } else {
        // good response...so let's update labels
        if (data) {
          if (data[0].favorite == 0) {
            console.log(JSON.stringify(data));
            console.log("fav: " + data[0].favorite);
            db2.run(
              'UPDATE photoLabels SET favorite = ? WHERE fileName = ?', ["1", img],
              updateCallback);

            function updateCallback(err) {
              console.log("updating fav");
              if (err) {
                console.log(err + "\n");
                sendCode(400, response, "requested photo not found");
              } else {
                // send a nice response back to browser
                response.status(200);
                response.type("text/plain");
                response.send("change fav to 1");
              }
            }
          } else if (data[0].favorite == 1) {
            console.log(JSON.stringify(data));
            console.log("fav: " + data[0].favorite);
            db2.run(
              'UPDATE photoLabels SET favorite = ? WHERE fileName = ?', ["0", img],
              updateCallback);

            function updateCallback(err) {
              console.log("updating fav");
              if (err) {
                console.log(err + "\n");
                sendCode(400, response, "requested photo not found");
              } else {
                // send a nice response back to browser
                response.status(200);
                response.type("text/plain");
                response.send("change fav to 0");
              }
            }
          } else {
            sendCode(400, response, "requested fav not found");
          }

        } else {
          sendCode(400, response, "requested fav not found");
        }
      }



      // Insert or replace rows into the table

      db2.close();
      // You need to uncomment the line below when you uncomment the call
      // to db.serialize
    }
  });


}

function answer5(query, response) { //get fav
  var dbFile = "photos.db"
  var db2 = new sqlite3.Database(dbFile); // new object, old DB

  queryObj = querystring.parse(query);
  var img = queryObj.img;

  db2.serialize(function() {

    console.log("starting DB operations");
    console.log("answering");

    db2.all('SELECT fileName FROM photoLabels LIMIT 10', dataCallback);

    function dataCallback(err, data) {
      console.log("getting Fav");
      if (err) {
        console.log("error: ", err, "\n");
      } else {
        // good response...so let's update labels
        if (data[(img - 1)]) {
          // console.log(JSON.stringify(data));
          response.status(200);
          response.type("text/json");
          response.send(data[(img - 1)].favorite);
        } else {
          sendCode(400, response, "requested fav not found");
        }
      }
    }




    //  console.log(query);
    //  console.log(dataCallback);

    // Insert or replace rows into the table

    db2.close();


    // You need to uncomment the line below when you uncomment the call
    // to db.serialize
  });



}
