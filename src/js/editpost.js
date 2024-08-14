function editpost(req, res, conn, fotodir, fs) {
 //pieprasijuma saturs

 let request = {
  idpost: req.body.idpost,
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
 // ja ir fails pievienots
 if (ufile && typeof filecount === "undefined") {
  replacepic(conn, request, fotodir, fs);
 }
 if (request.title != null) {
  title(conn, request);
 }
 if (request.pdesc != null) {
  desc(conn, request);
 }
 if (req.body.removeflag == "true") {
  removepic(conn, req, fotodir, fs);
 }

 if (ufile && filecount > 0) {
  addpicarr(conn, req, fotodir, fs);
 }

 console.log("editpost OK");
 res.send({ Status: "OK" });
}

function title(conn, request) {
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

function replacepic(conn, request, fotodir, fs) {
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

function desc(conn, request) {
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
function removepic(conn, req, fotodir, fs) {
 let re = {
  idpost: req.body.idpost,
  imgarr: req.body.imgarr,
  imgpath: req.body.imgpath,
 };
 let singleimg = false;
 if (re.imgpath != null) {
  singleimg = true;
 }
 if (singleimg) {
  try {
   console.log(re.imgpath);
   let fotoname = re.imgpath;
   if (fotoname != null) {
    fs.unlinkSync(fotodir + fotoname);
    console.log("attels" + fotoname + " dzests");
   } else {
    console.log("Nav attela");
   }
  } catch (error) {
   console.log("Dzests neizdevas:", error);
  }
  conn.query('UPDATE lietotnes.posts SET  imgpath = null WHERE idposts = "' + re.idpost + '"', function (err) {
   if (!err) {
    console.log("Rinda " + re.idpost + " labota , attels noņemts :" + re.imgpath);
   } else {
    console.log("Error:", err);
   }
  });
 }
 if (re.imgarr != null) {
  for (let i = 0; i < re.imgarr.length; i++) {
   try {
    let fotoname = re.imgarr[i];
    if (fotoname != null) {
     fs.unlinkSync(fotodir + fotoname);
     console.log("attels" + fotoname + " dzests");
    } else {
     console.log("Nav attela");
    }
   } catch (error) {
    console.log("Dzests neizdevas:", error);
   }
   let origarr = [];
   let noarry = false;
   conn.query('select imgarr from lietotnes.posts where idposts = "' + re.idpost + '"', function (err, rows, fields) {
    if (!err) {
     origarr = rows[0].imgarr;
    } else {
     console.log("Error:", err);
     noarry = true;
    }
   });
   if (!noarry) {
    let fotoname = re.imgarr[i];
    if (fotoname != null) {
     let index = origarr.indexOf(fotoname);
     let newarr = origarr.splice(index, 1);
     conn.query(
      "update lietotnes.posts set imgarr = ? where idposts = ?",
      [JSON.stringify(origarr), re.idpost],
      function (err) {
       if (!err) {
        console.log("Rinda " + re.idpost + " labota , attels noņemts :" + imgpath);
       } else {
        console.log("Error:", err);
       }
      }
     );
    }
   }
  }
 }
}
function addpicarr(conn, req, fotodir, fs) {
 let re = {
  idpost: req.body.idpost,
  filearr: req.files.file,
 };
 let origarr = {
  images: [],
 };
 let noarry = false;
 conn.query('select imgarr from lietotnes.posts where idposts = "' + re.idpost + '"', function (err, rows, fields) {
  if (!err) {
   origarr = rows[0].imgarr;
   console.log(origarr);
   if (origarr == null) {
    origarr = {
     images: [],
    };
   }
  } else {
   console.log("Error:", err);
   noarry = true;
  }
 });
 if (!noarry) {
  for (let i = 0; i < re.filearr.length; i++) {
   let imgpath = Date.now() + re.filearr[i].name;
   origarr.images.push(imgpath);
   re.filearr[i].mv(fotodir + imgpath, (err) => {
    if (err) {
     console.log(err);
    }
   });
  }
  conn.query(
   "update lietotnes.posts set imgarr = ? where idposts = ?",
   [JSON.stringify(origarr), re.idpost],
   function (err) {
    if (!err) {
     console.log("Rinda " + re.idpost + " labota , attelu kopa izmainita :" + origarr);
    } else {
     console.log("Error:", err);
    }
   }
  );
 }
}

module.exports = {
 editpost,
};
