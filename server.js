
/**
 * Module dependencies.
 */

var express 	= 	require('express')
var routes 		= 	require('./routes')
var io			=	require('socket.io');
var connect		=	require('connect');
var classjs 	= 	require('./public/javascripts/class.js');
var functions 	= 	require('./public/javascripts/functions.js');
var mysql 		= 	require('mysql');

var app 		= 	module.exports 	= 	express.createServer();
var json 		= 	JSON.stringify;

var port 		= 	process.env.PORT || 13476;

var parseCookie = 	connect.utils.parseCookie;
	
// BLACKNIGHT
var REPORT_DATABASE 	= 	'db1104243_ernie';

// HEROKU
//var	REPORT_DATABASE = 'heroku_3c3d586f6d78228';

// LOCALHOST
//var REPORT_DATABASE 	= 	'ernie';
var	EMPLOYEE_TABLE = 'ernie_employees';
var	SQLclient = mysql.createClient({

		// BLACKNIGHT
		host: 'mysql1156.cp.blacknight.com',
  		user: 'u1104243_ernie',
  		password: '4thYearProject',
  		
  		// HEROKU
  		//host: 'us-mm-auto-dca-01.cleardb.com',
  		//user: '77408e24a20620',
  		//password: 'ed8a92b5',
  		//port: 3306
  		
  		// LOCALHOST
  		//host: 'localhost',
  		//user: 'root',
  		//password: 'mancity'
		});

SQLclient.query('CREATE DATABASE '+REPORT_DATABASE, function(err) {
  if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
    throw err;
  }
});
SQLclient.query('USE '+REPORT_DATABASE);

SQLclient.query(
  'CREATE TABLE IF NOT EXISTS '+EMPLOYEE_TABLE+
  '(id INT(11) AUTO_INCREMENT, '+
  'name VARCHAR(255), '+
  'position TEXT, '+
  'email TEXT, '+
  'PRIMARY KEY (id))'
);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.set('view options', { pretty: true }); // Uncomment to make source look readable
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'secret', key: 'express.sid'}));
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.dynamicHelpers({
  loggedIn: function (req, res) {
    return req.cookies.loggedin;
  },
  userID: function (req, res) {
  	if(req.cookies.loggedin == 'true')
    	return req.cookies.userid;
    	
    return null;
  },
  userName: function (req, res) {
    //return getUsername(req.cookies.userid);
    if(req.cookies.loggedin == 'true')
    {
	    /*SQLclient.query(
	  						'SELECT `name` FROM '+EMPLOYEE_TABLE+' WHERE `id` = '+ req.cookies.userid,
	  						function selectCb(err, results, fields) {
	    					if (err) {
	      					throw err;
	    					}
	    					console.log('Username: '+ results[0]['name']);
	    					return results[0]['name'];
	    				});*/
	    				return "Eoin";
	}
	
	return null;
  },
  userLevel: function (req, res) {
  	if(req.cookies.loggedin == 'true')
    {
    	return getUserLevel(req.cookies.userid);
    }
    
    return null;
  },
  userHash: function (req, res) {
    if(req.cookies.loggedin == 'true')
    {
    	return req.cookies.userhash;
    }
    
    return null;
  },
});

app.get('/', routes.index);

app.get('/reports/:id?', routes.reports);

app.get('/main', routes.index);

app.get('/404', routes.error);

app.post('/login', function(req, res){

	var username = req.param('username', null);
	var password = req.param('password', null);
	
	var successful = false;
	console.log('post form: '+ username +'; '+ password);
	
	
	SQLclient.query('SELECT `id` FROM '+EMPLOYEE_TABLE+' WHERE (`username` = "'+ username +'" AND `password` = "'+password+'") LIMIT 1',
		function selectCb(err, results, fields) {
			if (err) 
			{
				throw err;
				console.log('error');
    		}
    		
    		
    		successful = (results !== undefined && results.length > 0);
    		if(successful)
    		{
    			res.cookie('userID', results[0]['id'], { expires: new Date(Date.now() + 900000)});
    		}
	
			res.contentType('application/json');
			var data = JSON.stringify(successful);
			res.header('Content-Length', data.length);
			console.log('Data: '+data);
			res.end(data); // ALWAYS make sure to 'end' a post.
    	});

});


//The 404 Route (ALWAYS Keep this as the last route)
app.use(function(req,res){
    res.render('404.jade', { locals: { 
                  header: '#Header#'
                 ,footer: '#Footer#'
                 ,title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                 ,loggedIn: req.cookies.loggedin
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
});


app.listen(port);
console.log('App IP: '+ app.address().port);
console.log('DATABASE: '+process.env.DATABASE_URL);
//console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

var socket = io.listen(app);

var users = [], count = 0;
socket.set('log level', 1); // reduce logging

socket.set('authorization', function (data, accept) {
    // check if there's a cookie header
    if (data.headers.cookie) {
        // if there is, parse the cookie
        data.cookie = parseCookie(data.headers.cookie);
        
        // Get cookie info
        for (var key in data.cookie) 
        {
   			var obj = data.cookie[key];
      		console.log('Cookie: '+ key + ' = ' + obj);
		}
        // note that you will need to use the same key to grad the
        // session id, as you specified in the Express setup.
        data.sessionID = data.cookie['express.sid'];
    } else {
       // if there isn't, turn down the connection with a message
       // and leave the function.
       return accept('No cookie transmitted.', false);
    }
    // accept the incoming connection
    accept(null, true);
});
 
socket.sockets.on('connection', function(client){
 

	console.log('SHA1: '+ functions.sha1('hello'));
	
	console.log('Session ID: '+ client.handshake.sessionID);
	
	var me = new User(users.length, 'Testing', 'true', client.handshake.sessionID);
	
	var other = new User(users.length, 'Other Person', 'true', client.handshake.sessionID);
	
	console.log("name of Client: " + me.getName());
	
	if(!inArray(users, me))
	{
		users.push(me);
		users.push(other);
		console.log('new connection');
	}
	client.join(client.handshake.sessionID);
	client.broadcast.emit('updateCount', getUserCount());
	console.log('New Connection, ip: '+ client.handshake.address.address);
		
	   
	client.on('disconnect', function(){
		client.leave('/'+client.handshake.sessionID);
		client.broadcast.emit('updateCount', getUserCount());
	
	});
	
	client.on('updateCount', function(){
		client.emit('updateCount', getUserCount());
	});
	
	client.on('db', function(msg){
	    msg = JSON.parse(msg)
	    SQLclient.query(
  						'INSERT INTO '+ EMPLOYEE_TABLE+' '+
  						'SET name = ?, position = ?, email = ?',
  						[msg.name, msg.position, msg.email], 
						  function(){ 
						  console.log('emitting update');
						  client.broadcast.emit('updatedDB', json(msg))
						  client.emit('updatedDB', json(msg))
						  }
						);
	 });
	 
	client.on('getUsers', function(){
	
		console.log('getUsers called')
		client.emit('getUsers', getUsers());
		
	
	});
	    
	client.on('initial', function(){
	    	 SQLclient.query(
  						'SELECT * FROM '+EMPLOYEE_TABLE,
  						function selectCb(err, results, fields) {
    					if (err) {
      					throw err;
    					}
    					client.emit('initial', json(results));
    				});
	    	});
	
});

function getUserLevel(userID)
{
	return 1;
}

function getUsername(userID)
{
	SQLclient.query(
  						'SELECT `name` FROM '+EMPLOYEE_TABLE+' WHERE `id` = '+userID,
  						function selectCb(err, results, fields) {
    					if (err) {
      					throw err;
    					}
    					console.log('Username: '+ results[0]['name']);
    					return results[0]['name'];
    				});
}

function getUsers()
{

	var onlineUsers = [];
		
	for(var i = 0; i < users.length; i++)
	{
		onlineUsers.push(users[i].getName());
	}
	
	return json(onlineUsers);
}

function getUserCount()
{
	
	var rooms = socket.sockets.manager.rooms;
	
	var count = 0;
	
	for (var key in rooms) 
	{
   		if(key != '')
   		{
   			count++;
   			console.log('Room: '+ key);
   		}
   		
	}
	
	getUsers();
	
	return count;


}

function inArray(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i].getSessionID() === obj.getSessionID()) {
           return true;
       }
    }
    return false;
}
var User = Class.extend({
	init 		: function(id, name, loggedIn, sessionID) {
			this.id 		= id;
			this.name 		= name;
			this.loggedIn 	= loggedIn;
			this.sessionID 	= sessionID
	},
    setId 		: function(id){
        	this.id = id;
    },
    getId 		: function(){
        	return this.id;
    },
    setName 	: function(name){
        	this.name = name;
    },
    getName 	: function(){
        	return this.name;
    },
    isLoggedIn 	: function(){
        	return this.loggedIn;
    },
    logIn 		: function(){
    		this.loggedIn = true;
    },
    logOut 		: function(){
    		this.loggedIn = false;
    },
    getSessionID	:	function(){
    		return this.sessionID
    },
    
});





/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();
