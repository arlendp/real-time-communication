var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var onlineList = [];
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    socket.broadcast.emit('online', socket.id);

    socket.on('user nickname', function(nickname) {
        var onlineUserInfo = new OnlineInfo(socket.id, nickname);
        if (!onlineList.find(function(element) {
            return element.id === socket.id;
        })) {
            onlineList.push(onlineUserInfo);
        }
        io.emit('online users', onlineList);
    });

    socket.on('disconnect', function() {
        if (onlineList.find(function(element) {
            return element.id === socket.id;
        })) {
            onlineList.splice(onlineList.find(function(element) {
                return element.id === socket.id;
            }), 1);
        }
        socket.broadcast.emit('offline', socket.id);
        io.emit('online users', onlineList);
    });
    socket.on('private message', function(id, nickname, message) {
        socket.join(id);
        socket.broadcast.to(id).emit('private message', nickname, message);
    });
    socket.on('chat message', function(nickname, msg) {
        socket.broadcast.emit('chat message', nickname, msg);
    });
    socket.on('someone is typing', function(id, nickname) {
        io.emit('someone is typing', id, nickname);
    });
    socket.on('someone has typed', function(id) {
        socket.broadcast.emit('someone has typed', id);
    });
});

//用于存储在线用户信息的构造函数
function OnlineInfo(id, nickname) {
    this.id = id;
    this.nickname = nickname;
}

http.listen(3000, function() {
    console.log('listening on port 3000');
});
