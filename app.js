var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express();

var token = process.env.TELEGRAM_TOKEN;

var votes = {
    yes: 0,
    no: 0
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/votes', function (req, res) {
    res.send('We have: ' + votes.yes + ' yes and ' + votes.no + ' no.');
});

app.post('/', function (req, res) {

    console.log(JSON.stringify(req.body));

    var chat_id = req.body.message.chat.id,
        text = req.body.message.text.toLowerCase(),
        qs = {};

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
            reply_markup: JSON.stringify({ "keyboard": [ ["Yes", "No"] ] }),
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

var server = app.listen(process.env.PORT, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});
