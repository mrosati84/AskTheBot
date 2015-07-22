(function () {
    var host = location.host,
        port = location.port;

    var socket = io.connect('http://' + host + ':' + port);

    socket.emit('ping', {});

    socket.on('pong', function (data) {
        console.log('Received', data.msg);
    });
}());
