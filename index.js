var express = require('express');

var app = express();
var server = require('http').Server(app);
var port = process.env.PORT || 3000;

var io = require('socket.io')(server); //initialize socket io on a server side

server.listen(port, function(){
	console.log("Port:" + port);
});

app.use(express.static(__dirname));
//send request
app.get('/', function(request,response){
	
	response.sendFile(__dirname + '/index.html');	
	
});
//send request to server
app.get('/onlineusers', function (request, response){
	console.log(io.sockets.adapter.rooms);
	response.send(io.sockets.adapter.rooms);	
});


io.on('connection', function(socket){
	
	console.log('user: '+ socket.id);
	
	//tell all clients that someone connected
	io.emit('user joined', socket.id)
	
	//the clients send 'chat.message' event to server
	socket.on('chat.message', function(message){
		//emit this event to all clients connected to it
		io.emit('chat.message',message);
	});
	
	 //client sends "user typing" event to server
    socket.on('user typing', function (username) {
        io.emit('user typing', username);
    });

    //client sends 'stopped typing' event to server
    socket.on('stopped typing', function (username) {
        io.emit('stopped typing', username);
    });
	
	socket.on('disconnect', function(){
		//tell all clients that someone disconnected
		console.log('user left: ' + socket.id);
		socket.broadcast.emit('user left', socket.id);
	});
});