function entry(req, res, conn, fotodir, fs) {
 let request = { idlist: req.body.idlist };
 if (typeof request.idlist == "string") {
  deletepost(request.idlist, conn, fotodir, fs);
 } else if (typeof request.idlist == "object") {
  deleteposts(request.idlist, conn, fotodir, fs);
 }

 res.send({ Status: "OK" });
}

function deleteposts(idlist = [], conn, fotodir, fs) {
 idlist.forEach((id) => {
  deletepost(id, conn, fotodir, fs);
 });
}
function deletepost(id, conn, fotodir, fs) {
 conn.query('SELECT imgpath,imgarr FROM lietotnes.posts WHERE idposts = "' + id + '"', function (err, rows, fields) {
  if (!err) {
   let singleimg = false;

   try {
    let fotoname = rows[0].imgpath;

    if (fotoname != null) {
     singleimg = true;
     fs.unlinkSync(fotodir + fotoname);
     console.log("attels" + fotoname + "dzests");
    } else {
     console.log("Nav attela");
    }
   } catch (error) {
    console.log("Dzests neizdevas:", error);
   }
   if (!singleimg) {
    try {
     let fotoname = rows[0].imgarr.images;
     for (let i = 0; i < fotoname.length; i++) {
      fs.unlinkSync(fotodir + fotoname[i]);
     }
     console.log("Dzesta attelu kopa : " + fotoname);
    } catch (error) {
     console.log("Dzest att kopu neizdevas:", error);
    }
   } else {
    console.log("kļūme Neatrada attelu datubazes saraksta .", err);
   }
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

module.exports = {
 entry,
};
