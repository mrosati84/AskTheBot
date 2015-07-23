$(function () {
    var host = location.host;
    var socket = io.connect('http://' + host);

    socket.on('connect', function () {

        console.log('socket connected');

        socket.on('ping', function (data) {
             console.log('Received', data.msg);
        });

        socket.on('questions', function (data) {
            console.log(data.questions);
        });

        socket.on('new-question', function (data) {
            console.log('new question');
            $('.question').text(data.question).fadeIn(100);
        });

        socket.on('clean-live-board', function (data) {
            $('.question').text('');
        });

        socket.on('questions',function (data) {
            appendListItems(data.questions);
        });

        socket.on('question',function (data) {
            appendListItem(data.question);
        });

    });

    var $list = $('#qts');
    var $liveBox = $('#live-question');

    $list.on('click','li span.live',function(e) {
        $list.find('li.live').addClass('sent');
        var $el = $(this).closest('li')
                    .addClass('live');
        var id = $el.data('id');
        var text = $el.find('p').text();
        $el.siblings().removeClass('live');
        $liveBox.find('p').text(text);
        socket.emit('put-live', { id: id, text: text });
    });

    $list.on('click','li span.remove',function(e) {
        var $el = $(this).closest('li');
        var id = $el.data('id');
        socket.emit('remove-question', { id : id });
        console.log(id);
        $el.fadeOut();
    });

    $('.remove-live').on('click',function(){
        $liveBox.find('p').text('...');
        socket.emit('remove-live-question');
    });



    var appendListItems = function(items) {
        $.each(items,function(i,el){
            var $li = $('<li data-id="'+ el._id +'">').html('<p>'+ el.question +'</p><div class="controls"><span class="live">Put live</span><span class="remove">Reject</span></div>');
            $list.prepend($li);
        });
    }

    var appendListItem = function(item) {
        var $li = $('<li data-id="'+ item._id +'">').html('<p>'+ item.question +'</p><div class="controls"><span class="live">Put live</span><span class="remove">Reject</span></div>');
        $list.prepend($li);
    }


}());
