var express = require('express');
var router = express.Router();
var connection = require('../connection');
var mysql = require('mysql');

router.get('/books/create', function(req, res, next) {
  console.log('Render Create Page')
  res.render('createBook');
});

router.post('/books/create', function(req, res, next) {
  console.log('Render Create Page2')
  var newAuthor,newPublisher,newBook;
  var sql1 = "SELECT * FROM authors where name=?;";
  var inserts = [req.body.authorname];
  sql1 = mysql.format(sql1, inserts);
  
  var sql2 = "SELECT * FROM publishers where name=?;";
  inserts = [req.body.publishername];
  sql2 = mysql.format(sql2, inserts);
  
  var sql3 = "SELECT * FROM books where title=?;";
  inserts = [req.body.title];
  sql3 = mysql.format(sql3, inserts);
  
  console.log('Executing Query:'+sql1+sql2+sql3);
  connection.query(sql1+sql2+sql3, function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!'+err);
      }
      console.log(results[0][0])
      console.log(results[1][0])
      console.log(results[2][0])
      if (results[2][0] != undefined) {
        console.log('Book Already Exists')
        res.redirect('/books/'+results[2][0].id);
      } else {
        newBook = true;
      }
      if (results[0][0] == undefined) {
        console.log('Author doesnt exist')
        newAuthor = true;
      } else {
        req.body.authorid = results[0][0].id
      }
      if (results[1][0] == undefined) {
        console.log('Publisher doesnt exist');
        newPublisher = true;
      } else {
        req.body.publisherid = results[1][0].id
      }
      if (newBook) {
        console.log('Creating new Book');
        connection.beginTransaction(function(err) {
          if (err) { 
            console.log('error starting Transaction');
            res.redirect('/'); 
          }
          console.log('Starting Transaction');
          sql1 = 'INSERT INTO authors (`name`) VALUES (?);'
          inserts = [req.body.authorname];
          sql1 = mysql.format(sql1, inserts);
          sql2 = 'INSERT INTO publishers (`name`) VALUES (?);'
          inserts = [req.body.publishername];
          sql2 = mysql.format(sql2, inserts);
          sql3 = 'INSERT INTO books (ISBN, title, authorid, published, publisherid, status, limage) '+
            'VALUES (?,?,?,?,?,?,?);'
          var sql= '';
          if(newAuthor)
            sql += sql1;
          if (newPublisher)
            sql += sql2;
          
          if(sql != ''){
            console.log('Executing Query:'+sql)
            connection.query(sql, function(err,results,fields){
              if(err) {
                connection.rollback(function() {
                      res.redirect('/');
                    });
              }
              if (newAuthor && newPublisher) {
                req.body.authorid = results[0].insertId
                req.body.publisherid = results[1].insertId
              } else if(newAuthor){
                console.log('Author Id:'+ results.insertId)
                req.body.authorid = results.insertId
              }
              else
                req.body.publisherid = results.insertId  
              inserts = [req.body.isbn, req.body.title,req.body.authorid,req.body.published,req.body.publisherid,req.body.status,req.body.limage];
              sql3 = mysql.format(sql3, inserts);
              console.log('Executing Query:'+sql3)
              connection.query(sql3, function(err,results,fields){
                if(err) {
                  console.log('Error getting data from table!!!'+err);
                }
                connection.commit(function(err) {
                      if (err) {
                        connection.rollback(function() {
                          res.redirect('/');
                        });
                      }
                      console.log('success!');
                      res.redirect('/books/'+results.insertId);
                    });
              });
            });
          } else {
            inserts = [req.body.isbn, req.body.title,req.body.authorid,req.body.published,req.body.publisherid,req.body.status,req.body.limage];
            sql3 = mysql.format(sql3, inserts);
            console.log('Executing Query:'+sql3)
            connection.query(sql3, function(err,results,fields){
              if(err) {
                console.log('Error getting data from table!!!'+err);
                res.redirect('/');
              }
              connection.commit(function(err) {
                    if (err) {
                      connection.rollback(function() {
                        res.redirect('/');
                      });
                    }
                    console.log('success!');
                    res.redirect('/books/profile/'+results.insertId);
                  });
            });
          }
        });
      }
  });
});

router.get('/books/profile/:id', function(req, res, next) {
  console.log('Render Get Page')
  var bookQuery = "SELECT b.id as id, title, a.name author, published, p.name publisher, authorid, publisherid,"+
  "status, limage FROM books b,authors a, publishers p WHERE b.authorid=a.id and b.publisherid = p.id "
  var sql = bookQuery + 'and b.id=?';
  var inserts = [req.params.id];
  sql = mysql.format(sql, inserts);
  console.log('Executing Query:'+sql)
  connection.query(sql, function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!');
        res.redirect('/');
      }
      console.log(results[0])
      res.render('bookProfile',{book:results[0]})
    })
});

router.get('/books/search', function(req, res, next) {
  console.log('Render Search Page')
  res.render('searchBook');
});

router.post('/books/search', function(req, res, next) {
  console.log('Render Search Page2')
  var sql = "Select * FROM books WHERE 1 ";
  if(req.body.title) {
    sql += 'and '
    sql += "title LIKE '%"+req.body.title+"%' "
  }
  if(req.body.authorname){
    sql += 'and '
    sql += "authorid in (SELECT id from authors where name LIKE '%"+
      req.body.authorname+"%') "
  }
  if(req.body.publishername){
    sql += 'and '
    sql += "publisherid in (SELECT id from publishers where name LIKE '%"+
      req.body.publishername+"%') "
  }
  if(req.body.start && req.body.end){
    sql += 'and '
    sql += "published BETWEEN "+req.body.start+" and "+req.body.end
  } else if(req.body.start) {
    sql += 'and '
    sql += "published ="+req.body.start
  }
  console.log("Executing Query:"+sql)
  connection.query(sql, function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!'+err);
        res.redirect('/');
      }
    res.render('readBooks', {title:'Search Results', books:results});
  });
  
});

router.get('/books/reading', function(req, res, next) {
  console.log('Render Reading Page')
  var sql = 'SELECT * FROM books WHERE status = 1 ORDER BY id'
  console.log('Executing Query:'+sql)
  connection.query(sql, function(err,results, fields){
    if(err){
      console.log('Error getting data from table!!!'+err)
      res.redirect('/');
    }
    res.render('readBooks',{title:'Books Currenlty Reading',
      books:results, read:true});
  });
});



router.get('/books/read', function(req, res, next) {
  console.log('Render Read Page')
  var sql = 'SELECT * FROM books WHERE status = 2 ORDER BY id';
  console.log("Executing Query:"+sql)
  connection.query(sql, function(err,results, fields){
    if(err){
      console.log('Error getting data from table!!!'+err)
      res.redirect('/');
    }
    res.render('readBooks',{title:'Books Read So Far',
      books:results, read:true});
  });
});



router.get('/books/unread', function(req, res, next) {
  console.log('Render Unread Page')
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
  console.log("Executing Query:"+query)
  connection.query(query, function(err,results, fields){
    if(err){
      console.log('Error getting data from table!!!');
      res.redirect('/');
    }
    res.render('readBooks',{title:'Books To Be Read', 
      books:results, read:false});
  });
});

router.get('/books/:id/update', function(req, res, next) {
  console.log('Render Upodate Page')
  
  var bookQuery = "SELECT ISBN, b.id as id, title, a.name author, published, p.name publisher, authorid, publisherid,"+
  "status, limage FROM books b,authors a, publishers p WHERE b.authorid=a.id and b.publisherid = p.id "
  var sql = bookQuery + 'and b.id=?';
  var inserts = [req.params.id];
  sql = mysql.format(sql, inserts);
  console.log('Executing Query:'+sql)
  connection.query(sql, function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!');
        res.redirect('/');
      }
      res.render('updateBook',{book:results[0]})
    })
});

router.post('/books/:id/update', function(req, res, next) {
  console.log('Render Update Page')
  connection.beginTransaction(function(err) {
    if (err) { 
      console.log('error starting Transaction');
      res.redirect('/');
    }
    var sql = "SELECT * FROM books where id=?;";
    var inserts = [req.params.id];
    sql = mysql.format(sql, inserts);
    console.log('Executing Query:'+sql)
    
    connection.query(sql, function(err,results,fields){
      if(err) {
        connection.rollback(function() {
              res.redirect('/');
            });
      }
      
      var sql1 = "UPDATE books SET title=?, published=?, status=? where id=?;";
      var inserts = [req.body.title, req.body.published, req.body.status, req.params.id];
      sql1 = mysql.format(sql1, inserts);
      
      var sql2 = "UPDATE authors SET name=? where id = ?;";
      inserts = [req.body.authorname, results[0].authorid];
      sql2 = mysql.format(sql2, inserts);
      
      var sql3 = "UPDATE publishers SET name=? where id = ?;";
      inserts = [req.body.publishername, results[0].publisherid];
      sql3 = mysql.format(sql3, inserts);
      
      console.log('Executing Query:'+sql1+sql2+sql3);
      connection.query(sql1+sql2+sql3, function(err,results,fields){
        if(err) {
          console.log('Error getting data from table!!!'+err);
          res.redirect('/');
        }
        connection.commit(function(err) {
          if (err) {
            connection.rollback(function() {
              res.redirect('/');
            });
          }
          console.log('success!');
          res.redirect('/books/profile/'+req.params.id);
        });
      });
    });
  });
});

router.post('/books/:id/delete', function(req, res, next) {
  console.log('Render Delete Page')
  var sql = "Delete from books WHERE id=?";
  var inserts = [req.params.id];
  sql = mysql.format(sql, inserts);
  console.log("Executing Query:"+sql)
  connection.query(sql, function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!'+err);
        res.redirect('/');
      }
      res.redirect('/books/search');
    })
});

router.get('/publishers/:id', function(req, res, next) {
    var sql1 = "SELECT * FROM publishers WHERE id = ? ;";
    var inserts = [req.params.id];
    sql1 = mysql.format(sql1, inserts);
    
    var sql2 = "SELECT * FROM books WHERE publisherid = ? ;";
    sql2 = mysql.format(sql2, inserts);
    
    connection.query(sql1 + sql2, function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!');
        res.redirect('/');
      }
      console.log(results[0])
      console.log(results[1])
      res.render('publishers/profile',{publisher:results[0][0], books:results[1]});
    })
});

router.get('/authors/:id', function(req, res, next) {
    var sql1 = "SELECT * FROM authors WHERE id = ? ;";
    var inserts = [req.params.id];
    sql1 = mysql.format(sql1, inserts);
    
    var sql2 = "SELECT * FROM books WHERE authorid = ? ;";
    sql2 = mysql.format(sql2, inserts);
    
    connection.query(sql1 + sql2, function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!');
        res.redirect('/');
      }
      console.log(results[0])
      console.log(results[1])
      res.render('authors/profile',{author:results[0][0], books:results[1]});
    })
});

router.get('/', function(req, res, next) {
  var sql1 = "Select * from user;";
  var sql2 = "Select count(*) from books where status=0;";
  var sql3 = "Select count(*) from books where status=1;";
  var sql4 = "Select count(*) from books where status=2;";
  console.log("Executing Queries:"+sql1+sql2+sql3+sql4);
  connection.query(sql1+sql2+sql3+sql4, function(err,results,fields){
    if(err) {
        console.log('Error getting data from table!!!'+err);
        res.redirect('/');
      }
    console.log(results)
    res.render('user/profile', { user: results[0][0], totalRead:results[3][0]['count(*)'],
      currentlyReading:results[2][0]['count(*)'], toRead:results[1][0]['count(*)']});
  });
});

router.get('/update', function(req, res, next) {
  connection.query("SELECT * from user",[req.params.id],
    function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!');
        res.redirect('/');
      }
      res.render('user/updateProfile',{user:results[0]})
    })
});

router.post('/update', function(req, res, next) {
  var sql = "UPDATE user SET name=?, email=?;";
  var inserts = [req.body.name, req.body.email];
  sql = mysql.format(sql, inserts);
  console.log('Running Query:'+ sql)
  connection.query(sql, function(err,results,fields){
      if(err) {
        console.log('Error getting data from table!!!'+err);
        res.redirect('/');
      }
    res.redirect('/');
  });
});
module.exports = router;