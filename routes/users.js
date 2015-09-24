var express = require('express');
var router = express.Router();
var connection = require('../connection');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get('/:id', function(req, res, next) {
  connection.query('SELECT * FROM users WHERE id=?',[req.params.id], function(error, results, fields){
    if(error) {
      res.send('problem with query' + req.params.id); 
    }
    console.log("User found:"+results[0])
    res.render('profile',{user:results[0]});   
  });
});

router.get('/:id/books', function(req, res, next) {
  connection.query('SELECT * FROM books WHERE bookid IN (SELECT bookid FROM '+
  'books_read where id=?)', [req.params.id], function(err,results, fields){
    if(err){
      console.log('Error getting data from table!!!')
    }
     for (var i = 0; i < results.length; i++) {
      console.log(results[i].name);
    }
    res.render('readBooks',{title:'Books Read So Far',
      id:req.params.id, books:results, read:true})
  });
});

router.get('/:id/books/unread', function(req, res, next) {
  connection.query('SELECT * FROM books WHERE bookid NOT IN (SELECT bookid FROM '+
  'books_read where id=?)', [req.params.id], function(err,results, fields){
    if(err){
      console.log('Error getting data from table!!!')
    }
     for (var i = 0; i < results.length; i++) {
      console.log(results[i].name);
    }
    res.render('readBooks',{title:'Books To Be Read', 
      id:req.params.id, books:results, read:false})
  });
  
});


router.get('/:id/books/add', function(req, res, next) {
  res.render('readBooks',{id:req.params.id})
});


module.exports = router;
