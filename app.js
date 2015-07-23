var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express(),
    socket = require('socket.io'),
    assert = require('assert'),
    mongo = require('mongodb'),
    ObjectID = mongo.ObjectID,
    MongoClient = mongo.MongoClient;

var helpers = require('./helpers'),
    events = require('./events');

var currentQuestionText = '';

// load dotenv
require('dotenv').load();

var mongodb = undefined;

// MongoDB set-up
var mongoURL = 'mongodb://' + process.env.MONGO_USER + ':' +
    process.env.MONGO_PASSWORD + '@' + process.env.MONGO_HOST + ':' +
    process.env.MONGO_PORT + '/' + process.env.MONGO_DB;

// get the telegram token
var token = process.env.TELEGRAM_TOKEN;

// MongoDb connection. All init stuff should be in this callback
MongoClient.connect(mongoURL, function(err, db) {
    if (err == null)
        console.log('MongoDB connected');

    // save a reference to mongodb
    mongodb = db;

    // call the socket connection event
    onSocketConnection();
});

// start express server
var server = app.listen(process.env.PORT, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});

// bind websocket to server
var io = socket(server);

var globalSocket = undefined;

function onSocketConnection () {
    io.on('connection', function (socket) {
        globalSocket = socket;
        var collection = mongodb.collection(process.env.MONGO_COLLECTION);

        console.log('socket connected');

        io.sockets.emit('current-question-text', { text: currentQuestionText });

        socket.on('put-live', function(data) {
            if (data.id)
                var id = new ObjectID(data.id);

            console.log('put live');
            socket.broadcast.emit('new-question', { question: data.text });

            if (id) {
                collection.update({ _id: id }, {$set: { put_live: true }}, function (err, result) {
                    if (err == null) {
                        console.log('Question with id ' + id + ' put live');

                        collection.find({ rejected: false }).toArray(function (err, docs) {
                            io.sockets.emit('questions', { questions: docs });
                        });
                    }
                });
            }
        });

        collection.find({ rejected: false }).toArray(function (err, docs) {
            io.sockets.emit('questions', { questions: docs });
        });

        socket.on('remove-live-question', function(data) {
            console.log('remove live question');
            socket.broadcast.emit('clean-live-board');
        });

        socket.on('set-current-question-text', function (data) {
            currentQuestionText = data.text;

            io.sockets.emit('current-question-text', { text: currentQuestionText });
        });

        io.sockets.emit('current-question-text', { text: currentQuestionText });

        socket.on('remove-question', function (data) {
            var id = new ObjectID(data.id);

            collection.update({_id: id}, {$set: {rejected: true}}, function(err, result) {
                if (err == null) {
                    console.log('Question with id ' + id + ' marked as rejected');

                    collection.find({ rejected: false }).toArray(function (err, docs) {
                        io.sockets.emit('questions', { questions: docs });
                    });
                }
            });
        });
    });
}

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

    // log the request body
    console.log(req.body);

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
                        text: "Welcome H-ARTIST " + req.body.message.chat.first_name + ",\nwant to ask anything to the speakers?\nWrite below your question."
                    };
                    events.sendMessage(token, qs);
                break;

                case '/dev':
                    qs = {
                        chat_id: chat_id,
                        text: "The creators of this amazing Bot are Matteo, Luca and Nicholas. 😎😎😎"
                    };
                    events.sendMessage(token, qs);
                break;
            };

        } else {
            if ((user_action.length > 6) && (helpers.countWords(user_action) > 2)) {
                // Domanda corretta, la scrivo su /manage

                qs = {
                    chat_id: chat_id,
                    text: "Question registered, thank you."
                };

                events.sendMessage(token, qs);

                var collection = mongodb.collection(process.env.MONGO_COLLECTION);

                collection.insert({
                    'question': user_action,
                    'rejected': false,
                    'put_live': false,
                    'first_name': req.body.message.from.first_name,
                    'last_name': req.body.message.from.last_name
                }, function (err, result) {
                    if (err != null) {
                        console.error('Mongo connection error')
                        process.exit();
                    }

                    collection.find({ rejected: false }).toArray(function (err, docs) {
                        io.sockets.emit('questions', { questions: docs });
                    });
                });

            } else {
                qs = {
                    chat_id: chat_id,
                    text: "Your question is too short."
                };
                events.sendMessage(token, qs);
            }
        }
    }

    res.send();

});

app.get('/manage', function (req, res) {
    res.render('manage', { 'title': 'Manage questions' });
});

app.get('/board', function (req, res) {
    res.render('board', { 'question': 'domanda' });
});
