var express = require('express');
var bodyParser = require('body-parser');
var TaskController = require(__dirname + '/Controller/Api/V1/TaskController');
var app = express();

app.use(bodyParser.json());

TaskController.register(app);

app.listen(3000, function () {
  console.log('Webservice app listening on port 3000');
});