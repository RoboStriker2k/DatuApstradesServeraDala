const express = require("express");
const fs = require("fs");
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
app.listen(27000, (err) => {if (err) {console.log(err);} else {console.log("Server running on port 27000");}});
if (fs.existsSync(__dirname + '/src/lietotnes/vue/')) {
    app.use("/vue/", express.static("./src/lietotnes/vue/"));
 }
 if (fs.existsSync(__dirname + '/src/lietotnes/react/')) {
    app.use("/react/", express.static("./src/lietotnes/react/"));
 }
 if (fs.existsSync(__dirname + '/src/lietotnes/angular/')) {
    app.use("/angular/", express.static("./src/lietotnes/angular/"));
 }
 app.use("/css", express.static("./src/assets/"));
