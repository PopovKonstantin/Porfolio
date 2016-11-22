var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();;

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/Portfolio');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

app.use(cookieParser());
app.use(session({
    secret: 'lord of Red Mirror',
    store: new MongoStore({
		host: '127.0.0.1',
        port: '27017',
        db: 'Portfolio',
		collection: 'sessions',
        url: 'mongodb://localhost:27017/Portfolio'
	}),
	maxAge: 60*60*1000,
	resave: true,
	saveUninitialized: true
}));
/*
app.use(express.session({
	secret: 'lord of Red Mirror',
	store: new MongoStore({
		mongoose_connection:db
	})
}));*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// makes db accessible to router
app.use(function(req,res,next){
    req.db = db;
    next();
});

// establishes middleware for express
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
var pseudoArray = ['admin']; //block the admin username (you can disable it)
server.listen(8080);
// app.listen(appPort);
console.log("Server listening on port " + 8080);

// Handle the socket.io connections

var users = 0; //count the users

io.sockets.on('connection', function (socket) { // First connection
	users += 1; // Add 1 to the count
	reloadUsers(); // Send the count to all the users
	socket.on('message', function (data) { // Broadcast the message to all
		if(pseudoSet(socket))
		{
			var transmit = {date : new Date().toISOString(), pseudo : socket.nickname, message : data};
			socket.broadcast.emit('message', transmit);
			console.log("user "+ transmit['pseudo'] +" said \""+data+"\"");
		}
	});
	socket.on('setPseudo', function (data) { // Assign a name to the user
		if (pseudoArray.indexOf(data) == -1) // Test if the name is already taken
		{
			pseudoArray.push(data);
			socket.nickname = data;
			socket.emit('pseudoStatus', 'ok');
			console.log("user " + data + " connected");
		}
		else
		{
			socket.emit('pseudoStatus', 'error') // Send the error
		}
	});
	socket.on('disconnect', function () { // Disconnection of the client
		users -= 1;
		reloadUsers();
		if (pseudoSet(socket))
		{
			console.log("disconnect...");
			var pseudo;
			pseudo = socket.nickname;
			var index = pseudoArray.indexOf(pseudo);
			pseudo.slice(index - 1, 1);
		}
	});
});

function reloadUsers() { // Send the count of the users to all
	io.sockets.emit('nbUsers', {"nb": users});
}
function pseudoSet(socket) { // Test if the user has a name
	var test;
	if (socket.nickname == null ) test = false;
	else test = true;
	return test;
}

module.exports = app;
