var express = require('express');
var router = express.Router();
var connection = require('../connection');
var mysql = require('mysql');

/* GET home page. */
router.get('/', function(req, res, next) {
  var sql1 = "Select * from user;";
  var sql2 = "Select count(*) from books where status=0;";
  var sql3 = "Select count(*) from books where status=1;";
  var sql4 = "Select count(*) from books where status=2;";
  console.log("Executing Queries:"+sql1+sql2+sql3+sql4);
  connection.query(sql1+sql2+sql3+sql4, function(err,results,fields){
    if(err) {
        console.log('Error getting data from table!!!'+err);
      }
    res.render('index', { user: results[0][0], totalRead:results[3][0]['count(*)'],
      currentlyReading:results[2][0]['count(*)'], toRead:results[1][0]['count(*)']});
  });
});

router.get('/update', function(req, res, next) {
  connection.query("SELECT * from user",[req.params.id],
    function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!');
      }
      res.render('updateProfile',{user:results[0]})
    })
});

router.post('/update', function(req, res, next) {
  console.log('$$$$$$$$$$$$$$$')
  console.log(req.body);
  console.log(req.body.email);
  res.redirect('/update');
});


router.get('/books/search', function(req, res, next) {
  res.render('searchBook');
});

router.post('/books/search', function(req, res, next) {
  var sql = "Select * FROM books WHERE ";
  var inserts = [];
  if(req.body.title) {
    sql += "title LIKE '%"+req.body.title+"%' "
    inserts.push(req.body.title);
  }
  if(req.body.authorid){
    sql += "authorid = '"+req.body.authorid+"' "
    inserts.push(req.body.authorid);
  }
  if(req.body.publisherid){
    sql += "publisherid = '"+req.body.publisherid+"' "
    inserts.push(req.body.publisherid);
  }
  if(req.body.published){
    sql += "published ="+req.body.published+" "
    inserts.push(req.body.published);
  }
  sql = mysql.format(sql, inserts);
  console.log("Executing Query:"+sql)
  connection.query(sql, function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!'+err);
      }
    res.render('readBooks', {title:'Search Results', books:results});
  });
  
});



router.get('/books/reading', function(req, res, next) {
  connection.query('SELECT * FROM books WHERE status = 1 ORDER BY id', 
      function(err,results, fields){
    if(err){
      console.log('Error getting data from table!!!'+err)
      throw err;
    }
    res.render('readBooks',{title:'Books Currenlty Reading',
      books:results, read:true});
  });
});



router.get('/books/read', function(req, res, next) {
  connection.query('SELECT * FROM books WHERE status = 2 ORDER BY id', 
      function(err,results, fields){
    if(err){
      console.log('Error getting data from table!!!'+err)
      throw err;
    }
    res.render('readBooks',{title:'Books Read So Far',
      books:results, read:true});
  });
});



router.get('/books/unread', function(req, res, next) {
  var query = "";
  if( req.param('firstID') && req.param('firstID') > 1) {
    query = "SELECT * from (SELECT * FROM books WHERE status = 0 and id <"+
      req.param('firstID') + " ORDER BY id DESC  LIMIT 10) sub ORDER BY id";
  } else if(req.param('lastID')){
    query = "SELECT * FROM books WHERE status = 0 and id >"+
      req.param('lastID') + " ORDER BY id LIMIT 10";
  } else {
    query = 'SELECT * FROM books WHERE status = 0 ORDER BY id LIMIT 10'
  }
  connection.query(query, function(err,results, fields){
    if(err){
      console.log('Error getting data from table!!!');
    }
    res.render('readBooks',{title:'Books To Be Read', 
      books:results, read:false});
  });
});



router.get('/books/:id', function(req, res, next) {
  connection.query("SELECT * from books where id=?",[req.params.id],
    function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!');
      }
      res.render('bookProfile',{book:results[0]})
    })
});



router.get('/books/:id/update', function(req, res, next) {
  connection.query("SELECT * from books where id=?",[req.params.id],
    function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!');
      }
      res.render('updateBook',{book:results[0]})
    })
});



router.post('/books/:id/update', function(req, res, next) {
  var sql = "UPDATE books SET title=?, authorid=?, published=?, publisherid=?, status=? where id=?";
  var inserts = [req.body.title, req.body.authorid, req.body.published, req.body.publisherid, req.body.status, req.params.id];
  sql = mysql.format(sql, inserts);
  console.log("Executing Query:"+sql)
  connection.query(sql, function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!'+err);
      }
      res.redirect('/books/'+req.params.id);
    })
});

router.post('/books/:id/delete', function(req, res, next) {
  var sql = "Delete from books WHERE id=?";
  var inserts = [req.params.id];
  sql = mysql.format(sql, inserts);
  console.log("Executing Query:"+sql)
  connection.query(sql, function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!'+err);
      }
      res.redirect('/books/search');
    })
});



module.exports = router;