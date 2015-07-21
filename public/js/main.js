(function () {
    var socket = io.connect('http://vm2:5000');

    socket.emit('ping', {});

    socket.on('pong', function (data) {
        console.log('Received', data.msg);
    });
}());
