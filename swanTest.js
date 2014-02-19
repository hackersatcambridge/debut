//http://stackoverflow.com/a/17996407/1136593
var express = require('express');
var app = express();

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.send(500, 'Something broke!');
});


app.use(express.static('test'));

app.listen(3000, function() { console.log("Server is up and running");  });