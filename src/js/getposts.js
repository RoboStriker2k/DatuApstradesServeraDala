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

function getposts(req, res) {
 let request = {
  ammount: req.query.ammount || 10,
  offset: req.query.offset || 0,
 };
 returnposts(request.ammount, request.offset, res);
}

module.exports = {
 getposts,
};
