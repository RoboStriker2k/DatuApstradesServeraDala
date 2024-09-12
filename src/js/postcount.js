function getpostcount ( conn , res){
    let time = new Date(Date.now());

    conn.query("select count(*) as postscount from lietotnes.posts", function (err, rows, fields) {
     if (!err) {
      console.log(
       "Kopejais Rindu skaits " + rows[0].postscount + "nosutīts laiks:",
       time.getMinutes() + ":" + time.getSeconds()+ "|" +time.getMilliseconds()
      );
      res.send({ Status: "OK", posts: rows });
     } else {
      console.log("Error while performing Query.", err);
      res.send({ Status: "Error", message: err });
     }
    });
}

module.exports ={
    getpostcount,
}