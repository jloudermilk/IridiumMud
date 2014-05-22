// setup a basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 31337;

var morgan	= require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

server.listen(port,function(){
	console.log('Server listening at port %d', port);
});

//set the static files location /public
app.use(express.static(__dirname + '/public')); 
//log every request to the console
app.use(morgan('dev'));
//pull information from html in POST
app.use(bodyParser());
// simulate DELETE and PUT
app.use(methodOverride());


var usernames = ['admin']; //block the admin username (you can disable it)
var numUsers = 0;

io.on('connection', function(socket){
	 var addedUser = false;
	 
	 //when the client emits 'new message', this listens and executes
	 socket.on('new message', function(data){
	 	//tell the client to execute 'new message'
	 	socket.broadcast.emit('new message',{
	 		username: socket.username,
	 		message: data
	 	});
	 });

	 //when the client emits 'add user', this listens and executes
	 socket.on('add user', function(username){
	 	//store the username in the socket session for this client
	 	socket.username = username;
	 	usernames[username] = username;
	 	numUsers++;
	 	addedUser = true;
	 	socket.emit('login',{
	 		numUsers: numUsers
	 	});
	 	//echo globally(all clients) that a person has connected\
	 	socket.broadcast.emit('user joined',{
	 		username: socket.username,
	 		numUsers: numUsers
	 	});
	 });
	 //when client emters 'stop typing', broadcats it to others
	 socket.on('stop typing', function(){
	 	socket.broadcast.emit('stop typing',{
	 		username: socket.username
	 	});
	 });

	 socket.on('disconnect', function(){
	 	//remove username from global usernames list
	 	if(addedUser){
	 		delete usernames[socket.username];
	 		numUsers--;


	 		//echo globally thjat this client has left
	 		socket.broadcast.emit('user left',{
	 			username:socket.username,
	 			numUsers: numUsers
	 		});
	 	}
	 });
});
