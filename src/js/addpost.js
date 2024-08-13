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
 // vairaku datņu auģsuplāde serverīa mapē un ievietošanadatubazē
 if (ufile && filecount > 0) {
  uploadmulti(conn, request, res, fotodir, fs, filecount, req);
 }
}

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
function uploaddataimg(req, res, imgpath) {
 conn.query(
  'INSERT INTO lietotnes.posts (title, pdesc, imgpath) VALUES ("' +
   req.title +
   '","' +
   req.pdesc +
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
//vairāku attēlu ievietošanas funkcija
function uploadmulti(conn, request, res, fotodir, fs, filecount, req) {
 let fnamearr = {
  images: [],
 };

 for (let i = 0; i < filecount; i++) {
  let imgpath = Date.now() + req.files.file[i].name;
  fnamearr.images.push(imgpath);
  request.file[i].mv(fotodir + imgpath, (err) => {
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
    console.log("Rinda ievietota datubaze");
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
