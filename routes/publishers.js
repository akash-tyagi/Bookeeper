var express = require('express');
var router = express.Router();
var connection = require('../connection');
var mysql = require('mysql');

/* GET home page. */
router.get('/:id', function(req, res, next) {
    var sql1 = "SELECT * FROM publishers WHERE id = ? ;";
    var inserts = [req.params.id];
    sql1 = mysql.format(sql1, inserts);
    
    var sql2 = "SELECT * FROM books WHERE publisherid = ? ;";
    sql2 = mysql.format(sql2, inserts);
    
    connection.query(sql1 + sql2, function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!');
      }
      console.log(results[0])
      console.log(results[1])
      res.render('publishers/profile',{publisher:results[0][0], books:results[1]});
    })
});

module.exports = router;