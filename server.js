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
const postscount= require("./src/js/postcount.js")
//config
dotenv.config();
const config=process.env
const conn = mysql.createConnection({
 host: config.host,
 user: config.usr,
 password: config.password,
 port: config.port,
});

conn.connect((error) => {
 if (error) {
  console.log(error);
 } else {
  console.log("Connected!");
 }
});
/* // db vaicajuma tests
let res = conn.query('SELECT * FROM lietotnes.posts', function (err, rows, fields) {if (!err) console.log( rows); elseconsole.log('Error while performing Query.', err );});*/

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

//Ierakstu skaita atgriežsanas funckija
app.get("/api/postscount", (req, res) => {
 postscount.getpostcount(conn,res)
});

// vispareja datu izgušanas ffunkcija bez meklešanas parametriem.
app.get("/api/getposts", (req, res) => {
 getposts.getposts(req, res,conn);
});

// path uz foto glabatuvi
let fotodir = __dirname + "\\imgpath\\database\\";
let imgnotfounddir = __dirname + "\\src\\assets\\notfound.png";
/// foto atgriezsana no foto datņu mapes
app.use(express.static(imgnotfounddir));
app.get(["/getfoto","/api/getfoto"], (req, res) => {
    let pathimg = resolve(fotodir + req.query.file);
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

// dzest ierakstus datubaze
app.post("/api/deleteposts", (req, res) => {
 deleteposts.entry(req, res, conn, fotodir, fs);
});

//define portu express serverim un klūdas izziņošanu.
app.listen(config.dataserver_port, (error) => {
 if (error) {
  console.log(error);
 } else {
  console.log("Data Server running on port: "+config.dataserver_port);
 }
});
// ierakstu iegušans funkcijas deklarācija express
app.post("/search", (req, res) => {
 searchfn.search(req, res, conn);
});
///iegut tieši vienu ierakstu
app.get("/api/getpost", (req, res) => {
 getposts.getpost( req,res,conn)
});
///// labot ierakstu datubaze ar vai  bez attela maiņas
app.post("/api/editpost", (req, res) => {
 //pieprasijuma saturs
 editp.editpost(req, res, conn, fotodir, fs);
});





const app2 = express();
app2.use((req, res, next) => {
   res.setHeader("Access-Control-Allow-Origin", "*");
   res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
   );
   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
   next();
  });
  app2.listen(config.app_server_port, (err) => {if (err) {console.log(err);} else {console.log("WEB Server running on port: "+config.app_server_port);}});
  if (fs.existsSync(__dirname + '/src/lietotnes/vue/')) {
      app2.use("/vue/", express.static("./src/lietotnes/vue/"));
   }
   if (fs.existsSync(__dirname + '/src/lietotnes/react/')) {
      app2.use("/react/", express.static("./src/lietotnes/react/"));
   }
   if (fs.existsSync(__dirname + '/src/lietotnes/angular/')) {
      app2.use("/angular/", express.static("./src/lietotnes/angular/"));
   }
   app2.use("/css", express.static("./src/assets/"));
  