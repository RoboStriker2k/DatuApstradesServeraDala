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
 if (ufile && req.body.replaceflag == "true") {
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

 if (ufile && req.body.replaceflag == "false") {
  console.log("addpicc called");
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
    removepicfromdisc(rows[0].imgpath, fs, fotodir);
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
function removepicfromdisc(fotoname, fs, fotodir) {
 try {
  if (fotoname != null) {
   fs.unlinkSync(fotodir + fotoname);
   console.log("attels" + fotoname + " dzests");
  } else {
   console.log("Nav attela");
  }
 } catch (error) {
  console.log("Dzests neizdevas:", error);
 }
}
function removepic(conn, req, fotodir, fs) {
 let re = {
  idpost: req.body.idpost,
  imgarr: JSON.parse(req.body.imgarr),
  imgpath: req.body.imgpath,
 };
 let origarr = {
  images: [],
 };
 let singleimg = false;
 if (re.imgpath != null) {
  singleimg = true;
 }
 if (singleimg) {
  removepicfromdisc(re.imgpath, fs, fotodir);
  conn.query('UPDATE lietotnes.posts SET  imgpath = null WHERE idposts = "' + re.idpost + '"', function (err) {
   if (!err) {
    console.log("Rinda " + re.idpost + " labota , attels noņemts :" + re.imgpath);
   } else {
    console.log("Error:", err);
   }
  });
 }

 conn.query('select imgarr from lietotnes.posts where idposts = "' + re.idpost + '"', function (err, rows, fields) {
  if (!err) {
   origarr = rows[0].imgarr;
   if (origarr == null) {
    origarr = {
     images: [],
    };
   }
   let newarr = JSON.parse(JSON.stringify(origarr));
   if (re.imgarr != null && typeof re.imgarr === "object") {
    for (let i = 0; i < re.imgarr.length; i++) {
     let fotoname = re.imgarr[i];
     removepicfromdisc(fotoname, fs, fotodir);
     if (newarr.images != null) {
      let index = newarr.images.indexOf(fotoname);
      if (index > -1) {
     newarr.images.splice(index, 1);
      }
     }
    }
   }
   if (re.imgarr != null && typeof re.imgarr === "string") {
    if (newarr.images != null) {
     let index = newarr.images.indexOf(re.imgarr);
     console.log("index :", index);
     if (index != -1) {
      newarr.images.splice(index, 1);
     }
    }
   }


   updateimgarr(conn, newarr, re);
  } else {
   console.log("Error:", err);
  }
 });
}

function addpicarr(conn, req, fotodir, fs) {
 let re = {
  idpost: req.body.idpost,
  filearr: req.files.file,
 };
 let origarr = {
  images: [],
 };
 conn.query('select imgarr from lietotnes.posts where idposts = "' + re.idpost + '"', function (err, rows, fields) {
  if (!err) {
   let newarr = rows[0].imgarr;

   if (newarr == null) {
    newarr = {
     images: [],
    };
   }
   if (newarr == null || newarr.length == 0) {
    console.log("no arr");
    origarr = {
     images: [],
    };
    convertimgathtoarr(conn, re);
   }
   if (newarr != null && newarr.length == 1) {
    origarr.images.push(newarr[0]);
   } else {
    origarr = newarr;
   }

   if (re.filearr.length == "undefined") {
    re.filearr[0].mv(fotodir + Date.now() + re.filearr[0].name, (err) => {
     if (err) {
      console.log(err);
     }
    });
   } else {
    for (let i = 0; i < re.filearr.length; i++) {
     let imgpath = Date.now() + re.filearr[i].name;
     
     origarr.images.push(imgpath);
     re.filearr[i].mv(fotodir + imgpath, (err) => {
      if (err) {
       console.log(err);
      }
     });
    }
   }
   updateimgarr(conn, origarr, re);
  } else {
   console.log("Error:", err);
  }
 });
}

function updateimgarr(conn, origarr, re) {
 if (origarr == null || origarr == []) {
  origarr = {
   images: [],
  };
 }
 console.log("arr before import to db", origarr);
 conn.query(
  "update lietotnes.posts set imgarr = ? where idposts = ?",
  [JSON.stringify(origarr), re.idpost],
  function (err) {
   if (!err) {
    console.log("Rinda " + re.idpost + " labota , attelu kopa izmainita");
   } else {
    console.log("Error:", err);
   }
  }
 );
}

function convertimgathtoarr(conn, req) {
 conn.query('select imgpath from lietotnes.posts where idposts = "' + req.idpost + '"', function (err, rows, fields) {
  if (!err) {
   let imgpath = rows[0].imgpath;
   if (imgpath != null) {
    let imgarr = {
     images: [],
    };
    imgarr.images.push(imgpath);
    conn.query(
     "update lietotnes.posts set imgarr = ? where idposts = ?",
     [JSON.stringify(imgarr), req.idpost],
     function (err) {
      if (!err) {
       console.log("Rinda " + req.idpost + " izmainita");
      } else {
       console.log("Error:", err);
      }
      conn.query('update lietotnes.posts set imgpath = null where idposts = "' + req.idpost + '"', function (err) {});
     }
    );
   }
  }
 });
}

module.exports = {
 editpost,
};
