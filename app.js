var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express(),
    socket = require('socket.io');

var helpers = require('./helpers'),
    events = require('./events/events');

// load dotenv
require('dotenv').load();

// start express server
var server = app.listen(process.env.PORT, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});

// bind websocket to server
io = socket(server);

// add some basic socket.io boilerplate
io.on('connection', function (socket) {
    console.log('socket connected');

    socket.on('ping', function (data) {
        console.log('received ping');
        socket.emit('pong', { msg: 'pong!' });
    });
});

var token = process.env.TELEGRAM_TOKEN;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set jade as view engine
app.set('view engine', 'jade');

// set public files folder
app.use(express.static('public'));

// root API route. Nothing fancy, just to show something to the user
app.get('/', function (req, res) {
    res.send('Hello World!');
});

// main application route, POST request.
// action is decided upon the value of req.body.message.text
app.post('/', function (req, res) {

    var chat_id = req.body.message.chat.id,
        user_action = req.body.message.text,
        qs = {}; // object containing the query string that will be serialized

    if (helpers.messageType(req) === "text") {

        if (helpers.isCommand(user_action)) {

            // Commands
            switch(user_action) {
                case '/start':
                    qs = {
                        chat_id: chat_id,
                        text: "MESSAGGIO DI BENVENUTO"
                    };
                    events.sendMessage(token, qs);
                break;

                case '/dev':
                    qs = {
                        chat_id: chat_id,
                        text: "MESSAGGIO DEV SONO FIGHI E BELLI"
                    };
                    events.sendMessage(token, qs);
                break;
            };

        } else {

            if (user_action.length > 6){

                // REGISTRO DOMANDA E LA INVIO A /MANAGE

            } else {
                qs = {
                    chat_id: chat_id,
                    text: "DOMANDA TROPPO CORTA"
                };
                events.sendMessage(token, qs);
            }

        }

    }

    res.send();

});

app.get('/manage', function (req, res) {
    res.render('manage', { 'title': 'Hey', 'message': 'Hello!' });
});

app.get('/board', function (req, res) {
    res.send('board of questions');
});
