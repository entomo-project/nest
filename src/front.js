var express = require('express');
var TaskController = require(__dirname + '/Controller/TaskController');
var app = express();

TaskController.register(app);

app.listen(3001, function () {
  console.log('Front app listening on port 3001');
});