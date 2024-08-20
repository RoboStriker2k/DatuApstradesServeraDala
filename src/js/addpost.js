function addpost(req, res, conn, fotodir, fs) {
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
 console.log(filecount)
 if (!ufile) {
  uploaddata(request, res,conn);
 }
 // datņu auģsuplāde serverīa mapē un ievietošanadatubazē
 if (ufile) {
  uploadmulti(conn, request, res, fotodir, fs, filecount, req);
 }
}

//datu ievietotšana datubazē bez attela.
function uploaddata(request, res,conn) {
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

//vairāku attēlu ievietošanas funkcija
function uploadmulti(conn, request, res, fotodir, fs, filecount, req) {
 let fnamearr = {
  images: [],
 };
 if (typeof(filecount)!=="undefined"){
 for (let i = 0; i < filecount; i++) {
  let imgpath = Date.now() + req.files.file[i].name;
  fnamearr.images.push(imgpath);
  request.file[i].mv(fotodir + imgpath, (err) => {
   if (err) {
    console.log(err);
   }
  });
 }
}
if (typeof(filecount)==="undefined"){
    let imgpath = Date.now() + request.file.name;
    fnamearr.images.push(imgpath)
    request.file.mv(fotodir + imgpath, (err) => {
        if (err) {
         console.log(err);
        }
       });
}
 conn.query(
  "insert into lietotnes.posts (title, pdesc,imgarr) values (?,?,?)",
  [request.title, request.pdesc, JSON.stringify(fnamearr)],
  function (err) {
   if (!err) {
    console.log("Rinda ar attkopu ievietota datubaze");
    res.send({ Status: "OK" });
   } else {
    console.log("Error while performing Query.", err);
    res.send({ Status: "Error:", message: err });
   }
  }
 );
}

module.exports = {
 addpost,
};
