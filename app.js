var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express();

var token = '112693445:AAFujpq05vZlb3ofCk2nNDCVlkyP7gAWxUA';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/', function (req, res) {
  console.log(JSON.stringify(req.body));

  var chat_id = req.body.chat_id;
  var qs = {};

  if (req.body.text === '/start') {
      // bot just opened
      qs = {
          "keyboard": [ ["Yes", "No"] ],
          chat_id: chat_id,
          text: "Welcome, " + req.body.first_name
      };

      request({
          url: 'https://api.telegram.org/bot' + token + '/sendMessage',
          method: 'POST',
          qs: qs
      }, function (err, response, body) {
          if (err) { console.log(err); return; }

          console.log('Got response ' + response.statusCode);
          console.log(body);

          res.send();
      });
  } else {
      qs = {
          chat_id: chat_id,
          text: 'You said ' + req.body.text
      };

      request({
          url: 'https://api.telegram.org/bot' + token + '/sendMessage',
          method: 'POST',
          qs: qs
      }, function (err, response, body) {
          if (err) { console.log(err); return; }

          console.log('Got response ' + response.statusCode);
          console.log(body);

          res.send();
      });
  }
});

var server = app.listen(process.env.PORT, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
