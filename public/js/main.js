(function () {
    var host = $('meta[name="host"]').attr('content'),
        port = $('meta[name="port"]').attr('content');

    var socket = io.connect('http://' + host + ':' + port);

    socket.emit('ping', {});

    socket.on('pong', function (data) {
        console.log('Received', data.msg);
    });
}());
