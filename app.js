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

  var chat_id = req.body.message.chat.id,
      qs = {};

  if (req.body.message.text === '/start') {
      // bot just opened
      qs = {
          reply_markup: JSON.stringify({ "keyboard": [ ["Yes", "No"] ] }),
          chat_id: chat_id,
          text: "Welcome, " + req.body.message.chat.first_name
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
          text: 'You said ' + req.body.message.text
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
