function search (req, res, conn) {
    let time = new Date(Date.now());

 let request = {
  searchtext: req.body.searchtext || "",
  ammount: req.body.ammount || 10,
  offset: req.body.offset || 0,
 };
 let count = 0;
 request.offset = request.offset * request.ammount;
 conn.query(
  'SELECT * FROM lietotnes.posts WHERE title LIKE "%' + request.searchtext + '%"',
  function (err, rows, fields) {
   if (!err) {
    count = rows.length;
   } else {
    console.log("Error while performing Query.", err);
   }
  }
 );
 conn.query(
  'SELECT * FROM lietotnes.posts WHERE title LIKE "%' +
   request.searchtext +
   '%" LIMIT ' +
   request.ammount +
   " OFFSET " +
   request.offset +
   "",
  function (err, rows, fields) {
   if (!err) {
    console.log("Meklet FN OK:", time.getMinutes() + ":" + time.getSeconds());
    res.send({ Status: "OK", posts: rows, count: count });
   } else {
    console.log("Meklesanas kļūme.", err);
    res.send({ Status: "Error", message: err });
   }
  }
 );
}
module.exports = {
 search,
};
