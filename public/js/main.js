(function () {
    var host = location.host;

    var socket = io.connect('http://' + host);

    socket.on('connect', function () {
        console.log('socket connected');

        socket.on('ping', function (data) {
            console.log('Received', data.msg);
        });
    });

}());
