function editpost(req, res,conn,fotodir) {
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
 console.log("editpost OK");
 res.send({ Status: "OK" });
}

module.exports = {
 editpost,
};
