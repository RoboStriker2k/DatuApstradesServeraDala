"use strict";
//server init

//express servers nepieciešams prikš datu apmaiņas sadaļas
const express = require("express");
const fileupload = require("express-fileupload");

//datu bazei
const mysql = require("mysql2");
//config
const dotenv = require("dotenv");
//datņu apstradei
const { resolve } = require("path");
const fs = require("fs");

//funkcijas
const editp = require("./src/js/editpost.js");
const searchfn = require("./src/js/search.js");
const deleteposts = require("./src/js/deleteposts.js");
const addpost = require("./src/js/addpost.js");
const getposts = require("./src/js/getposts.js");

//config
dotenv.config();
const conn = mysql.createConnection({
 host: process.env.host,
 user: process.env.usr,
 password: process.env.password,
 port: process.env.port,
});

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
   console.log(
    "Kopejais Rindu skaits " + rows[0].postscount + "nosutīts laiks:",
    time.getMinutes() + ":" + time.getSeconds()
   );
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
 getposts.getposts(req, res);
});

// path uz foto glabatuvi
let fotodir = __dirname + "\\imgpath\\database\\";
let imgnotfounddir = __dirname + "\\src\\assets\\notfound.png";
//////////////////////==================================////////////////////////////

/// foto atgriezsana
app.use(express.static(fotodir));
app.use(express.static(imgnotfounddir));

app.use("/getfoto", express.static(fotodir));
app.get("/getfoto", (req, res) => {
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

//// ierakstu augsupielāde

app.use(fileupload());
app.post("/api/addpost", (req, res) => {
 addpost.addpost(req, res, conn, fotodir, fs);
});

/// ---===========-------------/////

// dzest ierakstus datubaze

app.post("/api/deleteposts", (req, res) => {
 deleteposts.entry(req, res, conn, fotodir, fs);
});

//define portu express serverim un klūdas izziņošanu.
app.listen(3000, (error) => {
 if (error) {
  console.log(error);
 } else {
  console.log("Server running on port 3000");
 }
});
// ierakstu iegušans funkcijas deklarācija express
app.post("/search", (req, res) => {
 searchfn.search(req, res, conn);
});
///iegut tieši vienu ierakstu
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
 editp.editpost(req, res, conn, fotodir, fs);
});
