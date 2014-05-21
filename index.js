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


var monikers = ['admin']; //block the admin username (you can disable it)
var numUsers = 0;

io.on('connection', function(socket){
	 var addedUser = false;

	 //when the client emits 'new message', this listens and executes
	 socket.on('new message', function(data){
	 	//tell the client to execute 'new message'
	 	socket.broadcast.emit('new message',{
	 		moniker: socket.moniker,
	 		message: data
	 	});
	 });

	 //when the client emits 'add user', this listens and executes
	 socket.on('add user', function(moniker){
	 	//store the moniker in the socket session for this client
	 	socket.moniker = moniker;
	 	monikers[moniker] = moniker;
	 	numUsers++;
	 	addedUser = true;
	 	socket.emit('login',{
	 		numUsers: numUsers
	 	});
	 	//echo globally(all clients) that a person has connected\
	 	socket.broadcast.emit('user joined',{
	 		moniker: socket.moniker,
	 		numUsers: numUsers
	 	});
	 });
	 //when client emters 'stop typing', broadcats it to others
	 socket.on('stop typing', function(){
	 	socket.broadcast.emit('stop typing',{
	 		moniker: socket.moniker
	 	});
	 });

	 socket.on('disconnect', function(){
	 	//remove moniker from global monikers list
	 	if(addedUser){
	 		delete monikers[socket.moniker];
	 		numUsers--;


	 		//echo globally thjat this client has left
	 		socket.broadcast.emit('user left',{
	 			moniker:socket.moniker,
	 			numUsers: numUsers
	 		});
	 	}
	 });
});

/*
var io = require('socket.io').listen(server);
var jade = require('jade');

var monikerArray = ['admin']; //block the admin username (you can disable it)

// Views Options

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false });

// Render and send the main page
app.get('/', function(req, res){
  res.render('home.jade');
});
/* //for socket.io v1.0
server.listen(appPort);
console.log("Server listening on port" + appPort);
*/
// Handle the socket.io connections
/*
var users = 0; //count the users

io.sockets.on('connection', function (socket) { // First connection
	users++; // Add 1 to the count
	reloadUsers(); // Send the count to all the users
	socket.on('message', function (data) { // Broadcast the message to all
		if(monikerSet(socket))
		{
			var transmit = {date : new Date().toISOString(), moniker : returnmoniker(socket), message : data};
			socket.broadcast.emit('message', transmit);
			console.log("user "+ transmit['moniker'] +" said \""+data+"\"");
		}
	});
	socket.on('setmoniker', function (data) { // Assign a name to the user
		if (monikerArray.indexOf(data) == -1) // Test if the name is already taken
		{
			socket.set('moniker', data, function(){
				monikerArray.push(data);
				socket.emit('monikerStatus', 'ok');
				console.log("user " + data + " connected");
			});
		}
		else
		{
			socket.emit('monikerStatus', 'error') // Send the error
		}
	});
	socket.on('disconnect', function () { // Disconnection of the client
		users -= 1;
		reloadUsers();
		if (monikerSet(socket))
		{
			var moniker;
			socket.get('moniker', function(err, name) {
				moniker = name;
			});
			var index = monikerArray.indexOf(moniker);
			moniker.slice(index - 1, 1);
		}
	});
});

function reloadUsers() { // Send the count of the users to all
	io.sockets.emit('nbUsers', {"nb": users});
}
function monikerSet(socket) { // Test if the user has a name
	var test;
	socket.get('moniker', function(err, name) {
		if (name == null ) test = false;
		else test = true;
	});
	return test;
}
function returnmoniker(socket) { // Return the name of the user
	var moniker;
	socket.get('moniker', function(err, name) {
		if (name == null ) moniker = false;
		else moniker = name;
	});
	return moniker;
}*/