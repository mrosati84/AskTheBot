var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express(),
    socket = require('socket.io');

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

var votes = {
    yes: 0,
    no: 0
};

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

// get and display all the votes for the running poll
app.get('/votes', function (req, res) {
    res.send('We have: ' + votes.yes + ' yes and ' + votes.no + ' no.');
});

// main application route, POST request.
// action is decided upon the value of req.body.message.text
app.post('/', function (req, res) {

    console.log(JSON.stringify(req.body));

    var chat_id = req.body.message.chat.id, // telegram chat ID
        text = req.body.message.text.toLowerCase(), // the text the user has written
        qs = {}; // object containing the query string that will be serialized

    switch(text) {
        /**
         * RESET ALL VOTES
         */
        case '/reset':
        votes.yes = 0;
        votes.no = 0;

        qs = {
            chat_id: chat_id,
            text: 'Votes reset!',
            reply_markup: JSON.stringify({"hide_keyboard": true})
        };
        break;

        /**
         * START THE BOT OR START VOTING
         */
        case '/start':
        case '/vote':
        qs = {
            reply_markup: JSON.stringify({ "keyboard": [ ["Yes"], ["No"] ] }),
            chat_id: chat_id,
            text: "Welcome, " + req.body.message.chat.first_name + ", please vote"
        };
        break;

        /**
         * GET THE VOTES RESULTS
         */
        case '/results':
        qs = {
            reply_markup: JSON.stringify({"hide_keyboard": true}),
            chat_id: chat_id,
            text: 'We have: ' + votes.yes + ' yes and ' + votes.no + ' no.'
        };
        break;

        /**
         * VOTE YES
         */
        case 'yes':
        qs = {
            chat_id: chat_id,
            text: 'You said: ' + text,
            reply_markup: JSON.stringify({"hide_keyboard": true})
        };

        votes.yes++;
        break;

        /**
         * VOTE NO
         */
        case 'no':
        qs = {
            chat_id: chat_id,
            text: 'You said: ' + text,
            reply_markup: JSON.stringify({"hide_keyboard": true})
        };

        votes.no++;
        break;

        /**
         * UNRECOGNIZED COMMAND
         */
        default:
        qs = {
            chat_id: chat_id,
            text: 'Say what?',
            reply_markup: JSON.stringify({"hide_keyboard": true})
        };
        break;
    }

    // sent the response message (telegram message)
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
});

app.get('/manage', function (req, res) {
    res.render('manage', { 'title': 'Hey', 'message': 'Hello!' });
});

app.get('/board', function (req, res) {
    res.send('board of questions');
});
