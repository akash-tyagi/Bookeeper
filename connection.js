var mysql = require('mysql');

var connection = mysql.createConnection({
    host: process.env.IP,
    port: 3306,
    user: 'akashtyagi',
    password: '',
    database: 'c9'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  else {
    console.log('Database connected with id ' + connection.threadId);
    
    connection.query('CREATE TABLE IF NOT EXISTS books ( bookid int NOT NULL AUTO_INCREMENT, name varchar(25), '+ 
      'text varchar(255), published date, PRIMARY KEY (bookid))');
    connection.query('CREATE TABLE IF NOT EXISTS users (id int NOT NULL AUTO_INCREMENT, name varchar(25), '+
    'username varchar(25), PRIMARY KEY (id), UNIQUE (username))');
    connection.query('CREATE TABLE IF NOT EXISTS books_read (bookid int NOT NULL, id int NOT NULL, PRIMARY KEY (bookid,id))');
  }
});

module.exports = connection;