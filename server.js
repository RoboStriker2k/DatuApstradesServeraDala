"use strict";
//server init

//express servers nepieciešams prikš datu apmaiņas sadaļas
const express = require("express");
const fileupload = require("express-fileupload");

var http = require("http");
var https = require("https");
//datu bazei
const mysql = require("mysql2");
//config
const dotenv = require("dotenv");
//datņu apstradei
const { resolve } = require("path");
const fs = require("fs");

dotenv.config();
const conn = mysql.createConnection({
 host: process.env.host,
 user: process.env.usr,
 password: process.env.password,
 port: process.env.port,
});
//saisinajums console.log
function print(text) {
 console.log(text);
}

conn.connect((error) => {
 if (error) {
  console.log(error);
 } else {
  console.log("Connected!");
 }
});
/*
// db vaicajuma tests
let res = conn.query('SELECT * FROM lietotnes.posts', function (err, rows, fields) {
    if (!err)
        console.log( rows);
    else
        console.log('Error while performing Query.', err );
});*/

///express servera uzstade
const app = express();
app.use((req, res, next) => {
 res.setHeader("Access-Control-Allow-Origin", "*");
 res.setHeader(
  "Access-Control-Allow-Headers",
  "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
 );
 res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
 next();
});

//lapu skaits
app.get("/api/postscount", (req, res) => {
 let time = new Date(Date.now());

 conn.query("select count(*) as postscount from lietotnes.posts", function (err, rows, fields) {
  if (!err) {
   console.log("Rindu skaits nosutīts laiks:", time.getMinutes() + ":" + time.getSeconds());
   res.send({ Status: "OK", posts: rows });
  } else {
   console.log("Error while performing Query.", err);
   res.send({ Status: "Error", message: err });
  }
 });
});

//------------------------------------------///////////////////////////////////
//define ziņojumu apstradi .
// vispareja datu izgušanas ffunkcija bez meklešanas parametriem.
app.get("/api/getposts", (req, res) => {
 let request = {
  ammount: req.query.ammount || 10,
  offset: req.query.offset || 0,
 };
 returnposts(request.ammount, request.offset, res);
});

//funckija ierakstu atgriežsanai no datubazes
function returnposts(ammount = 10, offset = 0, res) {
 offset = offset * ammount;
 conn.query("select * from lietotnes.posts limit " + ammount + " offset " + offset + "", function (err, rows, fields) {
  if (!err) {
   console.log("Rindas nosutitas");
   res.send({ Status: "OK", posts: rows });
  } else {
   console.log("Error while performing Query.", err);
   res.send({ Status: "Error", message: err });
  }
 });
}
//------------------------------------------///////////////////////////////////
// path uz foto glabatuvi
let fotodirold = __dirname + "\\..\\..\\imgpath\\database\\";

let fotodir = __dirname + "\\imgpath\\database\\";
console.log(fotodir);
//////////////////////==================================////////////////////////////
/// foto atgriezsana
let imgnotfounddir = __dirname + "\\src\\assets\\notfound.png";

app.use(express.static(fotodir));
app.use(express.static(imgnotfounddir));

app.use("/getfoto", express.static(fotodir));
app.get("/getfoto", (req, res) => {
  print(fotodir + req.query.file + "getphotoproc");
 let pathimg = resolve(fotodir + req.query.file);
 
 if (!fs.existsSync(pathimg) || req.query.file === "NaN") {
  pathimg = imgnotfounddir;
 }
 res.sendFile(pathimg);
});

app.get("/api/getfoto", (req, res) => {
 // print(fotodir + req.query.file);
 let pathimg = resolve(fotodir + req.query.file);
 console.log(pathimg);
 if (!fs.existsSync(pathimg) || req.query.file === "NaN") {
  pathimg = imgnotfounddir;
 }
 res.sendFile(pathimg);
});

//// ierakstu augsulade

app.use(fileupload());
app.post("/api/addpost", (req, res) => {
 // print(req.files.file.name) // ieguts faila nosaukums

 let request = {
  title: req.body.title,
  pdesc: req.body.pdesc,
 };
 let ufile = false;
 let filecount = 0;
 if (req.files) {
  request.file = req.files.file;
  ufile = true;
  filecount = req.files.file.length;
 }
 if (!ufile) {
  uploaddata(request, res);
 } else if (ufile && typeof filecount === "undefined") {
  let imgpath = Date.now() + request.file.name; /// iegust augsupladejama faila nosaukumu, kas nodrosina faila neatkartotību
  //print(imgpath)
  uploaddataimg(request, res, imgpath); // datu ievietotšana datubazē.

  //vienas datnes ievietošana datņu glabatuve
  request.file.mv(fotodir + imgpath, (err) => {
   if (err) {
    console.log(err);
   }
  });
 }
 // vairaku datņu auģsuplāde serverī, un datu
 if (ufile && filecount > 0) {
  let fnamearr = {
    "images": [],
  }

  for (let i = 0; i < filecount; i++) {
   let imgpath = Date.now() + req.files.file[i].name;
   fnamearr.images.push(imgpath);
   request.file[i].mv(fotodir + imgpath, (err) => {
    if (err) {
     console.log(err);
    }
   });
  }
 
  conn.query( 'insert into lietotnes.posts (title, pdesc,imgarr) values (?,?,?)',
   [request.title, request.pdesc, JSON.stringify(fnamearr)], 
   function (err) {
    if (!err) {
     console.log("Rinda ievietota datubaze");
     res.send({ Status: "OK" });
    } else {
     console.log("Error while performing Query.", err);
     res.send({ Status: "Error:", message: err });
    }
   }
  )

 }
});


//datu ievietotšana datubazē bez attela.
function uploaddata(request, res) {
 conn.query(
  'INSERT INTO lietotnes.posts (title, pdesc) VALUES ("' + request.title + '", "' + request.pdesc + '")',
  function (err) {
   if (!err) {
    console.log("Rinda ievietota datubaze");
    res.send({ Status: "OK" });
   } else {
    console.log("Error while performing Query.", err);
    res.send({ Status: "Error:", message: err });
   }
  }
 );
}
///datu ievietotšana datubazē ar attelu.
function uploaddataimg(request, res, imgpath) {
 conn.query(
  'INSERT INTO lietotnes.posts (title, pdesc, imgpath) VALUES ("' +
   request.title +
   '", "' +
   request.pdesc +
   '", "' +
   imgpath +
   '")',
  function (err) {
   if (!err) {
    console.log("Rinda ar attelu ievietota datubaze");
    res.send({ Status: "OK" });
   } else {
    console.log("Error while performing Query.", err);
    res.send({ Status: "Error:", message: err });
   }
  }
 );
}

/// ---===========-------------/////

// dzest ierakstus datubaze

app.post("/api/deleteposts", (req, res) => {
 let request = { idlist: req.body.idlist };
 if (typeof request.idlist == "string") {
  deletepost(request.idlist);
 } else if (typeof request.idlist == "object") {
  deleteposts(request.idlist);
 }

 res.send({ Status: "OK" });
});

function deleteposts(idlist = []) {
 idlist.forEach((id) => {
  deletepost(id);
 });
}
function deletepost(id) {
 conn.query('SELECT imgpath FROM lietotnes.posts WHERE idposts = "' + id + '"', function (err, rows, fields) {
  if (!err) {
   try {
    let fotoname = rows[0].imgpath;
    print(fotoname);
    if (fotoname != null) {
     fs.unlinkSync(fotodir + fotoname);

     console.log("attels" + fotoname + "dzests");
    } else {
     console.log("Nav attela");
    }
   } catch (error) {
    console.log("Dzests neizdevas:", error);
   }
  } else {
   console.log("kļūme Neatrada attelu .", err);
  }
 });
 conn.query('DELETE FROM lietotnes.posts WHERE idposts = "' + id + '"', function (err) {
  if (!err) {
   console.log("Rindas dzestas NO DB");
  } else {
   console.log("Nav dzests no DB.", err);
  }
 });
}

//define portu express serverim un klūdas izziņošanu.
app.listen(3000, (error) => {
 if (error) {
  console.log(error);
 } else {
  console.log("Server running on port 3000");
 }
});

app.post("/search", (req, res) => {
 let time = new Date(Date.now());

 let request = {
  searchtext: req.body.searchtext || "",
  ammount: req.body.ammount || 10,
  offset: req.body.offset || 0,
 };
 let count = 0;
 request.offset = request.offset * request.ammount;
 conn.query(
  'SELECT * FROM lietotnes.posts WHERE title LIKE "%' + request.searchtext + '%"',
  function (err, rows, fields) {
   if (!err) {
    count = rows.length;
   } else {
    console.log("Error while performing Query.", err);
   }
  }
 );
 conn.query(
  'SELECT * FROM lietotnes.posts WHERE title LIKE "%' +
   request.searchtext +
   '%" LIMIT ' +
   request.ammount +
   " OFFSET " +
   request.offset +
   "",
  function (err, rows, fields) {
   if (!err) {
    console.log("Meklet FN OK:", time.getMinutes() + ":" + time.getSeconds());
    res.send({ Status: "OK", posts: rows, count: count });
   } else {
    console.log("Meklesanas kļūme.", err);
    res.send({ Status: "Error", message: err });
   }
  }
 );
});
///iegut vienu ierakstu
app.get("/api/getpost", (req, res) => {
 let request = {
  postiid: req.query.postiid,
 };
 conn.query('SELECT * FROM lietotnes.posts WHERE idposts = "' + request.postiid + '"', function (err, rows, fields) {
  if (!err) {
   res.send({ Status: "OK", posts: rows });
  } else {
   console.log("Error while performing Query.", err);
   res.send({ Status: "Error", message: err });
  }
 });
});
///// labot ierakstu datubaze ar vai  bez attela maiņas
app.post("/api/editpost", (req, res) => {
 //pieprasijuma saturs
 let request = {
  idpost: req.body.idpost,
  title: req.body.title,
  pdesc: req.body.pdesc,
 };
 let ufile = false;
 if (req.files) {
  request.file = req.files.file;
  ufile = true;
 }
 // ja ir fails pievienots
 if (ufile) {
  let imgpath = Date.now() + request.file.name;
  conn.query(
   'Select imgpath FROM lietotnes.posts WHERE idposts = "' + request.idpost + '"',
   function (err, rows, fields) {
    if (!err) {
     try {
      let fotoname = rows[0].imgpath;
      if (fotoname != null) {
       fs.unlinkSync(fotodir + fotoname);
       console.log("attels" + fotoname + " dzests");
      } else {
       console.log("Nav attela");
      }
     } catch (error) {
      console.log("Dzests neizdevas:", error);
     }
    } else {
     console.log("kļūme Neatrada attelu .", err);
    }
   }
  );
  request.file.mv(fotodir + imgpath, (err) => {
   if (err) {
    console.log(err);
   } else {
    console.log("attels" + imgpath + " uz diska");
   }
  });
  conn.query(
   'UPDATE lietotnes.posts SET  imgpath = "' + imgpath + '" WHERE idposts = "' + request.idpost + '"',
   function (err) {
    if (!err) {
     console.log("Rinda labota imgpath :" + imgpath);
    } else {
     console.log("Error:", err);
    }
   }
  );
 }
 if (request.title != null) {
  conn.query(
   'UPDATE lietotnes.posts SET  title = "' + request.title + '" WHERE idposts = "' + request.idpost + '"',
   function (err) {
    if (!err) {
     console.log("Rinda labota title :" + request.title);
    } else {
     console.log("Error:", err);
    }
   }
  );
 }
 if (request.pdesc != null) {
  conn.query(
   'UPDATE lietotnes.posts SET  pdesc = "' + request.pdesc + '" WHERE idposts = "' + request.idpost + '"',
   function (err) {
    if (!err) {
     console.log("Rinda labota pdesc :" + request.pdesc);
    } else {
     console.log("Error:", err);
    }
   }
  );
 }
 print("editpost OK");
 res.send({ Status: "OK" });
});
