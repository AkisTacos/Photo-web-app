// uploads an image within a form object.  This currently seems
// to be the easiest way to send a big binary file.

var tagID = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var tagN = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var i = 1;
var j = 0;
var k = 0;
var glbary = [];

function uploadFile() {
  var url = "http://138.68.25.50:12029";

  // where we find the file handle
  var selectedFile = document.getElementById('fileSelector').files[0];
  var formData = new FormData();
  var image = document.getElementById('img1');
  var tmp = document.getElementById('tempImg');
  var progress = document.getElementById('tempImg');
  var progress2 = document.getElementById('ProgressBar');
  var progressH = document.getElementById('pHolder');
  var modal = document.getElementById('myModal');

  modal.style.display = "none";
  // tmp.style.display = "inline-block";
  // stick the file into the form
  image.style.opacity = ".5";
  var fr = new FileReader();
  // anonymous callback uses file as image source
  fr.onload = function() {
    image.src = fr.result;
    tmp.style.display = "inline-block";
    console.log(image.src);
    image.style.opacity = ".5";

  };

  fr.readAsDataURL(selectedFile); // begin reading

  formData.append("userfile", selectedFile);


  // more or less a standard http request
  var oReq = new XMLHttpRequest();
  // POST requests contain data in the body
  // the "true" is the default for the third param, so
  // it is often omitted; it means do the upload
  // asynchornously, that is, using a callback instead
  // of blocking until the operation is completed.
  // var pbar = document.createElement("p");
  // pbar.style.color = "white";
  // pbar.style.borderRadius = "4px";
  // pbar.style.backgroundColor = "#CCCCCC"
  // pbar.style.border = "none";
  // fr.onprogress = function(event) {
  //   if (event.lengthComputable) {
  //     var percentage = parseInt(((event.loaded / event.total) * 100), 10);
  //     progress2.innerHTML = percentage;
  //   }
  // };
  // progress.appendChild(pbar);

  // oReq.upload.addEventListener("progress", function(evt) {
  //     if (evt.lengthComputable) {
  //       progress2.innerHTML = evt.loaded + "/" + evt.total);
  //   }
  // }, false);

  oReq.upload.addEventListener("progress", ProgressHandler);

  function ProgressHandler(e) {
    var complete = Math.round(e.loaded / e.total * 100);
    console.log(complete + "% complete");
    // progress2.innerHTML = complete + "% complete";
    progress2.style.width = complete + '%';
    if (e.loaded != e.total) {
      progressH.style.display = "block";

    } else if (e.loaded == e.total) {
      progressH.style.display = "none";
      image.style.opacity = "1";

    }
  }


  oReq.open("POST", url, true);
  oReq.onload = function() {
    // the response, in case we want to look at it
    console.log(oReq.responseText);
  }
  selectedFile.value = '';
  oReq.send(formData);
}

/* called when image is clicked */
function getImage(imageNumber) {
  // construct url for query
  var url = "http://138.68.25.50:12029/query?" + imageNumber;
  console.log(url);



  // becomes method of request object oReq
  function reqListener() {
    var pgh = document.getElementById("image" + imageNumber);
    var pgh2 = document.getElementById("holdImg" + imageNumber);
    var name = "";
    var tag = "";
    var Pson;

    var pgh3 = document.getElementById("tagSpace" + imageNumber);
    var pgh4 = document.getElementById("form" + imageNumber);
    var pgh5 = document.getElementById("fav" + imageNumber);

    var tagar = [];
    name = this.response;
    Pson = JSON.parse(name);
    tagar = Pson.labels.split("|");
    // alert(Pson.fileName);
    pgh5.src = "../Assets/fav" + Pson.favorite + ".png";
    pgh5.style.width = "25px";
    pgh5.style.height = "25px";
    pgh5.style.marginLeft = "20px";
    pgh5.style.marginBottom = "-5px";
    pgh5.onclick = function() {
      addFav(Pson.fileName);

    }

    for (i = 0; i < 10; i++) {
      if (i >= 9) {
        // pgh4.style.display = "none";
      }
      if (tagar[i]) {

        var storeTag = document.createElement("button");
        storeTag.id = tagar[i];
        storeTag.innerHTML = tagar[i] + " x";
        storeTag.style.color = "white";
        storeTag.style.borderRadius = "4px";
        storeTag.style.backgroundColor = "#9f9f9f"
        storeTag.style.border = "none";
        storeTag.onclick = function() {
          var clickedTag = this.id;
          window.location.reload();
          var url = "http://138.68.25.50:12029/query?op=del&tag=" + clickedTag + "&img=" + Pson.fileName;

          var oReq = new XMLHttpRequest();
          oReq.open("GET", url);
          oReq.send();
        };
        pgh2.appendChild(storeTag);
      }
    }








    if (name == "requested photo not found") {
      pgh2.style.display = "none";

    } else {
      pgh2.style.display = "inline-table";

    }
    console.log("NAME = " + name);
    pgh.innerHTML = '<img id = "Pimg' + imageNumber + '" src = "../uploads/' + Pson.fileName + '" >';
    tagN[i] = Pson.fileName;
    console.log(imageNumber);
    tagID[i] = imageNumber;
    console.log("TAGNgetI = " + tagN[i]);
    console.log("ID = " + tagID[i]);
    i++;
    console.log(pgh.innerHTML);
  }

  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener);
  oReq.open("GET", url);
  oReq.send();

}

function getTag() {
  // construct url for query
  if (j > 10) {
    return;
  }
  if (k > 9) {
    return;
  }
  j++;

  var url = "http://138.68.25.50:12029/query?tag=" + tagID[j] + "&tagN=" + tagN[j];

  console.log(url);
  console.log("TAGID = " + tagID[j]);
  console.log("TAGNgetN = " + tagN[tagID[j]]);
  // becomes method of request object oReq

  function reqListener() {
    if (k > 9) {
      return;
    }
    k++;
    var pgh2 = document.getElementById("tagSpace" + k);
    var pgh3 = document.getElementById("form" + k);

    var tagar = [];
    tagar = this.responseText.split("|");


    console.log("tags should be:");
    for (i = 0; i < 10; i++) {
      if (i >= 9) {
        pgh3.style.display = "none";
      }
      if (tagar[i]) {
        console.log("TAGNAME = " + tagar[i]);
        var storeTag = document.createElement("button");
        storeTag.id = tagar[i];
        storeTag.class = tagN[k];
        storeTag.innerHTML = tagar[i] + " x";
        storeTag.style.color = "white";
        storeTag.style.borderRadius = "4px";
        storeTag.style.backgroundColor = "#9f9f9f"
        storeTag.style.border = "none";
        storeTag.onclick = function() {
          var clickedTag = this.id;

          var url = "http://138.68.25.50:12029/query?op=del&tag=" + clickedTag + "&img=" + storeTag.class;

          var oReq = new XMLHttpRequest();
          oReq.open("GET", url);
          oReq.send();

          window.location.reload();

        };
        pgh2.appendChild(storeTag);

        // var para = '\"' + tagar[i] + '\"' + ',' + '\"' + tagN[j] + '\"';
        // pgh2.innerHTML += tagar[i] + '<button id ="deletetag' + i + '"onclick = "deleteTag(' + para + ')\">x </button>';
        // pgh2.innerHTML += tagar[i] + '<button  onclick = "deleteTag(' + '"' + tagar[i] + '"' + ',' + '"' + tagN[j] + '"' + ')" id = "deletetag" + ' + i + ' >Stuff</button>';
        // pgh2.innerHTML += tagar[i];

        // var stringExtract = document.createElement("button");
        // stringExtract.onclick = function() {
        //   var url = "http://138.68.25.50:12029/query?op=del&tag=" + "aki" + "&img=" + tagN[j];
        //
        //   var oReq = new XMLHttpRequest();
        //   oReq.open("GET", url);
        //   oReq.send();
        // };
        // stringExtract.id = "deleteTag" + i;
        // stringExtract.innerHTML = tagar[i] + "x";
        // pgh2.appendChild(stringExtract);



      }
    }
    console.log(tagar);

    console.log(pgh2.innerHTML);


  }

  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener);
  oReq.open("GET", url);
  oReq.send();
}



function addTag(tagNumber) {
  var tag = document.getElementById("search" + tagNumber).value;
  var image = document.getElementById("Pimg" + tagNumber).src;
  var eemagy = image.split('http://138.68.25.50:12029/uploads/');
  var url = "http://138.68.25.50:12029/query?op=add&img=" + eemagy[1] + "&label=" + tag;


  var oReq = new XMLHttpRequest();
  oReq.open("GET", url);
  oReq.send();

}

function addFav(imgName) {

  var url = "http://138.68.25.50:12029/query?fop=fav&img=" + imgName;

  function reqListener() {
    if (oReq.status == "200") {
      window.location.reload();
    }
  }
  var oReq = new XMLHttpRequest();
  oReq.open("GET", url);
  oReq.addEventListener("load", reqListener);
  oReq.send();


}

function getFav(tagNumber) {

  var url = "http://138.68.25.50:12029/query?op=fad&img=" + tagNumber;

  function reqListener() {
    var pgh = document.getElementById("fav" + tagNumber);
    var fav = "";
    fav = this.responseText;
    console.log("FAV = " + fav);

    pgh.innerHTML = '<img id="fav' + tagNumber + '" src="../Assets/fav' + fav + '.png" onclick="addFav()">';
    console.log(pgh.innerHTML);
  }


  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener);
  oReq.open("GET", url);
  oReq.send();

}

function deleteTag(tagName, tagfilename) {
  var delTag33 = tagName;
  var filename = tagfilename;
  console.log("deleteTagname =" + delTag33);
  console.log("deleteFIleName =" + filename);
  var url = "http://138.68.25.50:12029/query?op=del&tag=" + delTag33 + "&img=" + filename;


  var oReq = new XMLHttpRequest();
  oReq.open("GET", url);
  oReq.send();

}

function search_es() {
  var pgh = document.getElementById("filter").value;
  var url = "http://138.68.25.50:12029/query?gpe=search&filter=" + pgh;


  // becomes method of request object oReq
  function reqListener2() {
    console.log("ENTERD INTO DELTE CHKLDREN");
    name = this.response;
    var parsed = JSON.parse(name);
    console.log(parsed);
    console.log(parsed[0]["fileName"]);
    for (var i = 1; i < 11; i++) {
      var pgh2 = document.getElementById("holdImg" + i);
      pgh2.style.display = "none";
    }
    for (var i = 0, len = parsed.length; i < len; i++) {
      var j = i + 1;
      var pgh3 = document.getElementById("holdImg" + j);
      var pgh4 = document.getElementById("image" + j);

      pgh3.style.display = "inline-block";
      pgh4.innerHTML = '<img id = "Pimg' + j + '" src = "../uploads/' + parsed[i]["fileName"] + '" >';
    }
  }

  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener2);
  oReq.open("GET", url);
  oReq.send();
}

function filterFav() {
  var url = "http://138.68.25.50:12029/query?gpe=search&type=fav";


  // becomes method of request object oReq
  function reqListener2() {
    name = this.response;
    var parsed = JSON.parse(name);
    console.log(parsed);
    console.log(parsed[0]["fileName"]);
    for (var i = 1; i < 11; i++) {
      var pgh2 = document.getElementById("holdImg" + i);
      pgh2.style.display = "none";
    }
    for (var i = 0, len = parsed.length; i < len; i++) {
      var j = i + 1;
      var pgh3 = document.getElementById("holdImg" + j);
      var pgh4 = document.getElementById("image" + j);

      pgh3.style.display = "inline-block";
      pgh4.innerHTML = '<img id = "Pimg' + j + '" src = "../uploads/' + parsed[i]["fileName"] + '" >';
    }
  }

  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener2);
  oReq.open("GET", url);
  oReq.send();
}


// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

var subBtn = document.getElementById("filterBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

var clear = document.getElementById("clearBtn");

clear.onclick = function() {
  window.location.reload();
}


// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


subBtn.onclick = function() {
  search_es();
  return false;
}

var firstMethod = function() {
  var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      console.log('first method completed');
      resolve({
        data: '123'
      });
    }, 300);
    getImage(1);
    // getFav(1);

  });
  return promise;
};


var secondMethod = function(someStuff) {
  var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      console.log('second method completed');
      resolve({
        newData: someStuff.data + ' some more data'
      });
    }, 300);
    getImage(2);
    // getFav(2);
  });
  return promise;
};
var thirdMethod = function(someStuff) {
  var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      console.log('second method completed');
      resolve({
        newData: someStuff.data + ' some more data'
      });
    }, 300);
    getImage(3);
    // getFav(3);
  });
  return promise;
};
var fourthMethod = function(someStuff) {
  var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      console.log('second method completed');
      resolve({
        newData: someStuff.data + ' some more data'
      });
    }, 300);
    getImage(4);
    // getFav(4);
  });
  return promise;
};
var fifthMethod = function(someStuff) {
  var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      console.log('second method completed');
      resolve({
        newData: someStuff.data + ' some more data'
      });
    }, 300);
    getImage(5);
    // getFav(5);
  });
  return promise;
};
var sixthMethod = function(someStuff) {
  var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      console.log('second method completed');
      resolve({
        newData: someStuff.data + ' some more data'
      });
    }, 300);
    getImage(6);
    // getFav(6);
  });
  return promise;
};
var seventhMethod = function(someStuff) {
  var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      console.log('second method completed');
      resolve({
        newData: someStuff.data + ' some more data'
      });
    }, 300);
    getImage(7);
    // getFav(7);
  });
  return promise;
};
var eigthMethod = function(someStuff) {
  var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      console.log('second method completed');
      resolve({
        newData: someStuff.data + ' some more data'
      });
    }, 300);
    getImage(8);
    // getFav(8);
  });
  return promise;
};
var ninthMethod = function(someStuff) {
  var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      console.log('second method completed');
      resolve({
        newData: someStuff.data + ' some more data'
      });
    }, 300);
    getImage(9);
    // getFav(9);
  });
  return promise;
};

var tenthMethod = function(someStuff) {
  var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      console.log('third method completed');
      resolve({
        result: someStuff.newData
      });
    }, 300);
    getImage(10);
    // getFav(10);
  });
  return promise;
};
var eleventhMethod = function(someStuff) {
  var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      console.log('third method completed');
      resolve({
        result: someStuff.newData
      });
    }, 300);

  });
  return promise;
};


window.onload = function() {

  firstMethod()
    .then(secondMethod)
    .then(thirdMethod)
    .then(fourthMethod)
    .then(fifthMethod)
    .then(sixthMethod)
    .then(seventhMethod)
    .then(eigthMethod)
    .then(ninthMethod)
    .then(tenthMethod)
    .then(eleventhMethod);
  // getImage(1, dataCallback);
  //
  // function dataCallback() {
  //
  //   getImage(2);
  // }
  //
  //
  //
  //
  //
  // getImage(3);
  //
  // getImage(4);
  //
  // getImage(5);
  //
  // getImage(6);
  //
  // getImage(7);
  //
  // getImage(8);
  //
  // getImage(9);
  //
  // getImage(10);


};
