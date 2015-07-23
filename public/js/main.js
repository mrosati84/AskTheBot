$(function () {
    var host = location.host;
    var socket = io.connect('http://' + host);

    var $list = $('#qts');
    var $liveBox = $('#live-question');

    socket.on('connect', function () {

        console.log('socket connected');

        socket.on('new-question', function (data) {
            console.log('new question');
            $('.question').text(data.question).fadeIn(100);
        });

        socket.on('clean-live-board', function (data) {
            $('.question').text('');
        });

        socket.on('questions',function (data) {
            console.log(data.questions);
            appendListItems(data.questions);
        });

        socket.on('question',function (data) {
            appendListItem(data.question);
        });

        socket.on('current-question-text', function (data) {
            $liveBox.find('p').text(data.text);
        });

    });

    $list.on('click','li span.live',function(e) {
        $list.find('li.live').addClass('sent');
        var $el = $(this).closest('li')
                    .addClass('live');
        var id = $el.data('id');
        var text = $el.find('p').text();
        $el.siblings().removeClass('live');
        $liveBox.find('p').text(text);
        socket.emit('put-live', { id: id, text: text });
        socket.emit('set-current-question-text', { text: text });
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
        $list.empty();

        $.each(items,function(i,el){
            var className = el.put_live ? 'sent' : '';
            var $li = $('<li class="'+ className +'" data-id="'+ el._id +'">').html('<p>'+ el.question +'</p><div class="controls"><span class="live">Put live</span><span class="remove">Reject</span></div>');
            $list.prepend($li);
        });
    }

    var appendListItem = function(item) {
        var className = item.put_live ? 'sent' : '';
        var $li = $('<li class="'+ className +'" data-id="'+ item._id +'">').html('<p>'+ item.question +'</p><div class="controls"><span class="live">Put live</span><span class="remove">Reject</span></div>');
        $list.prepend($li);
    }


}());
