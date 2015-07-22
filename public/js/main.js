$(function () {
    var host = location.host;
    var socket = io.connect('http://' + host);

    socket.on('connect', function () {

        console.log('socket connected');

        socket.on('ping', function (data) {
             console.log('Received', data.msg);
        });



    });
 socket.on('new-question', function (data) {
            console.log('New question');
            $('.question').text('CIAO').fadeIn(100);
        });
    var $list = $('#qts');
    var $liveBox = $('#live-question');

    $list.on('click','li span.live',function(e) {
        $list.find('li.live').addClass('sent');
        var $el = $(this).closest('li')
                    .addClass('live')
                    .siblings()
                    .removeClass('live');
        var id = $el.data('id');
        var text = $el.find('p').text();
        $liveBox.find('p').text(text);
        socket.emit('put-live', { id : id });
    });

    $list.on('click','li span.remove',function(e) {
        var $el = $(this).closest('li');
        var id = $el.data('id');
        socket.emit('remove-question', { id : id });
        $el.remove();
    });

    $('.remove-live').on('click',function(){
        $liveBox.find('p').text('...');
        socket.emit('remove-live-question');
    });


}());
