
/**
 * Module dependencies.
 */

var express		=	require('express');
var routes		=	require('./routes');
var io			=	require('socket.io');
var connect		=	require('connect');
var functions 	= 	require('./public/javascripts/functions.js');
var	config		=	require('./private/config.js');
var	User		=	require('./private/User.js');
var	Session		=	require('./private/Session.js');
var mysql 		= 	require('mysql');
var	winston		=	require('winston');

var app         =   module.exports  =   express.createServer();
var json        =   JSON.stringify;
var	users		=	[];
var	sessions	=	[];

sessions.push(new Session(1, "testSession", "true", "true", 1, "/main/", false))


var parseCookie =   connect.utils.parseCookie;

var port 		= 	process.env.PORT || 13476;
var	dbInfo		=	JSON.parse(config.getDBInfo(''));
var	dbTables	=	JSON.parse(config.getDBTables());

//
// Configure the logger for `access logs`
//
  winston.loggers.add('access', {
    file: {
		filename: 'logs/access.log'
    }
  });

//
// Configure the logger for `access logs`
//
  winston.loggers.add('error', {
    file: {
		filename: 'logs/error.log'
    }
  });

//
// Configure the logger for `access logs`
//
  winston.loggers.add('change', {
    file: {
		filename: 'logs/change.log'
    }
  });

var accessLog = winston.loggers.get('access');
var errorLog = winston.loggers.get('error');
var changeLog = winston.loggers.get('change');

accessLog.remove(winston.transports.Console);
errorLog.remove(winston.transports.Console);
changeLog.remove(winston.transports.Console);

// BLACKNIGHT
var	REPORT_DATABASE		=	dbInfo.db;
var	EMPLOYEE_TABLE		=	dbTables.employees;


var	SQLclient = mysql.createClient({

		// BLACKNIGHT
		host: dbInfo.host,
  		user: dbInfo.user,
  		password: dbInfo.password,
		});

SQLclient.query('USE '+REPORT_DATABASE);



// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { pretty: true }); // Uncomment to make source look readable
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
  	{
  		if(typeof users[req.cookies.userid] === "undefined")
  			addUsertoArray(req.cookies.userid, req.session.id);
    	return req.cookies.userid;
    }
    return null;
  },
  userName: function (req, res) {
    //return getUsername(req.cookies.userid);
    if(req.cookies.loggedin == 'true' && (typeof req.cookies.userid !== "undefined") && (typeof users[req.cookies.userid] !== "undefined"))
    {
    	//TODO: Add user to array (addUserToArray) with callback to send the name
	   	return users[req.cookies.userid].getName();
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

app.get('/projects/:id?', routes.projects);

app.get('/timesheets/:id?', routes.timesheets);

app.get('/s/:sessionid?/', routes.session);

app.get('/main', routes.index);

app.get('/graphs', routes.graph);

app.get('/404', routes.error);

app.post('/login', function(req, res){

	var username = req.param('username', null);
	var password = req.param('password', null);
	
	var successful = false;
	
	var userID = -1;
	
	
	SQLclient.query('SELECT `employee_id`, `name` FROM '+EMPLOYEE_TABLE+' WHERE (`username` = "'+ username +'" AND `password` = "'+password+'") LIMIT 1',
		function selectCb(err, results, fields) {
			if (err) 
			{
				throw err;
				console.log('error');
    		}
    		successful = (results !== undefined && results.length > 0);
    		if(successful)
    		{
    			userID = results[0]['employee_id'];
    			var days = 1;
    			res.cookie('userID', userID, { maxAge: daysToMillis(days)});
    			users[userID] = new User(userID, results[0]['name'], 'true', req.session.id);
    		}
	
			res.contentType('application/json');
			var data = json(userID);
			res.header('Content-Length', data.length);
			console.log('Data: '+data);
			res.end(data); // ALWAYS make sure to 'end' a post.
    	});

});

app.post('/submitTimesheet', function(req, res){

	var emp_id = req.cookies.userid
	var project_id = req.param('project_id', null);
	var task_id = req.param('task_id', null);
	
	var date_worked = req.param('date_worked', null);
	var dateParts = date_worked.split("/");
	var sqlDate = dateParts[2] + dateParts[1] + dateParts[0];
	
	var start_time = req.param('start_time', null);
	var end_time = req.param('end_time', null);
	var comments = req.param('comment', null);
	
	var successful = false;
	
	// TODO: Change to '?' notation as in example
	SQLclient.query('INSERT INTO `ernie_timesheet_entries` (`project_id`, `employee_id`, `task_id`, `date_worked`, `start_time`, `end_time`, `comments`) VALUES '+
	'('+ project_id +', '+ emp_id +', '+ task_id +', "'+ sqlDate +'", "'+ start_time +':00", "'+ end_time +':00", "'+ comments +'");', function(err, info){
	
			if (err) 
			{
				throw err;
				var date = new Date();
				errorLog.error('MySQL Error', {date: date.toUTCString(), location: 'SubmitTimesheet', errorMsg: err});
				successful = 'false';
    		}
    		else
    		{
    			successful = true;
    		}
    		res.contentType('application/json');
			var data = json(successful);
			res.header('Content-Length', data.length);
			console.log('Data: '+data);
			res.end(data);
	
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

var socket = io.listen(app);

var count = 0;
socket.set('log level', 1); // reduce logging

socket.set('authorization', function (data, accept) {
    // check if there's a cookie header
    if (data.headers.cookie) {
        // if there is, parse the cookie
        data.cookie = parseCookie(data.headers.cookie);
        
        // Get cookie info
        /*for (var key in data.cookie) 
        {
   			var obj = data.cookie[key];
      		console.log('Cookie: '+ key + ' = ' + obj);
		}*/
        // note that you will need to use the same key to grad the
        // session id, as you specified in the Express setup.
        data.sessionID = data.cookie['express.sid'];
        data.userID = data.cookie['userid'];
    } else {
       // if there isn't, turn down the connection with a message
       // and leave the function.
       return accept('No cookie transmitted.', false);
    }
    // accept the incoming connection
    accept(null, true);
});
 
socket.sockets.on('connection', function(client){
	var myID = client.handshake.userID;
	if(typeof myID !== "undefined")
	{
	
		getUsername(myID, function(username){
		
	
			if((typeof myID !== "undefined") && myID !== null && !userIsInArray(myID))
			{
				
				users[myID] = new User(myID, username, 'true', client.handshake.sessionID);
			}
			else
			{
				//users[myID].addSession();
			}
			
			
			//addUserToSession(client, users[myID], sessions[0]);
			var date = new Date()
			accessLog.info('User connected', {date: date.toUTCString(), userID: myID, userName: users[myID].getName()});
			client.broadcast.emit('updateCount', getUserCount());
			client.emit('updateCount', getUserCount());
		
		
		});
	}
	//console.log('New Connection, ip: '+ client.handshake.address.address);
	client.on('disconnect', function(){
		//console.log('disconnected');
		if(typeof users[myID] !== "undefined" && users[myID] !== null && users[myID].getSession() != null)
		{
			var userSession = users[myID].getSession();
			userSession.removeUser(myID);
			if(userSession.userCount() == 0 && userSession.getId() != '1')
			{
				console.log('removing session');
				//sessions.splice(sessions.indexOf(userSession), 1);
			}
			client.leave('/'+users[myID].getSession().getName());
		}
		/*console.log(myID +' sessions: '+ users[myID].sessionCount());
		if(users[myID].sessionCount() == 0)
		{
			console.log('removing');
			users.splice(myID, 1); // Remove it if really found
		}*/
		client.broadcast.emit('updateCount', getUserCount());
	
	});
	
	client.on('sortItem', function(sort){
		console.log('sending swap');
		client.broadcast.to(users[myID].getSession().getName()).emit('sortItem', json(sort));
		
	});

	client.on('changePos', function(pos){
		client.broadcast.to(users[myID].getSession().getName()).emit('changePos', json(pos));
		
	});
	client.on('sendChat', function(msg){
		if(users[myID].getSession() != null)
		{
			console.log('got chat' + users[myID].getSession().getName());
			var username = users[myID].getName();
			var sentChat = {user: username, text: msg, fromMe: false};
			client.broadcast.to(users[myID].getSession().getName()).emit('receiveChat', json(sentChat));
			var userChat = {user: username, text: msg, fromMe: true};
			client.emit('receiveChat', json(userChat));
		}
		//client.in(users[myID].getSession().getName()).emit('receiveChat', json(sentChat));
	
	});
	
	client.on('isTyping', function(){
		if(users[myID].getSession() != null)
		{
			client.broadcast.to(users[myID].getSession().getName()).emit('isTyping', json(users[myID]));
		}
	});
	
	client.on('stopTyping', function(){
		if(users[myID].getSession() != null)
		{
			client.broadcast.to(users[myID].getSession().getName()).emit('stopTyping', json(users[myID]));
		}
	});
	
	client.on('getGraph', function(id, callback){
		SQLclient.query('SELECT timesheet.*, employee.*, COUNT(tasks.id), tasks.task_name, projects.project_id, projects.project_name '+
 						'FROM '+dbTables['employees']+' employee INNER JOIN '+dbTables['timesheets'] +' timesheet '+
						'ON employee.employee_id = timesheet.employee_id '+
						'INNER JOIN '+dbTables['tasks'] +' tasks '+
						'ON timesheet.task_id = tasks.id '+
						'INNER JOIN '+dbTables['projects'] +' projects '+
						'ON timesheet.project_id = projects.project_id '+
						'WHERE employee.employee_id = '+id+' GROUP BY tasks.id', 
  						function selectCb(err, results, fields) {
    					if (err) {
      					throw err;
    					}
    					var tasks = {task : results}; 
    					callback(json(tasks));
    				});
	
	});
	
	client.on('getTasksProjectBreakdown', function(data, callback){
		
	
		SQLclient.query('SELECT timesheet.*, employee.employee_id, tasks.id, tasks.task_name, COUNT(projects.project_id), projects.project_name '+
 						'FROM '+dbTables['employees']+' employee INNER JOIN '+dbTables['timesheets'] +' timesheet '+
						'ON employee.employee_id = timesheet.employee_id '+
						'INNER JOIN '+dbTables['tasks'] +' tasks '+
						'ON timesheet.task_id = tasks.id '+
						'INNER JOIN '+dbTables['projects'] +' projects '+
						'ON timesheet.project_id = projects.project_id '+
						'WHERE timesheet.employee_id = '+data.employee+' AND timesheet.task_id = '+ data.task +' GROUP BY projects.project_id',
  						function selectCb(err, results, fields) {
    					if (err) {
      					throw err;
    					}
    					var projects = {project : results}; 
    					callback(json(projects));
    					client.emit('graphReady');
    				});
	
	});
	
	client.on('updateCount', function(){
		client.emit('updateCount', getUserCount());
	});
	
	client.on('joinSession', function(sessionName, callback){
		var joinedSession = getSession(sessionName);
		addUserToSession(client, users[myID], joinedSession);
		client.broadcast.to(sessionName).emit('notification', users[myID].getName() +' has joined your session');
		console.log('sending note');
		if(typeof callback != 'undefined')
		{
			callback(json({currentPage: joinedSession.getCurrentPage(), name: joinedSession.getName()}));
		}
	
	})
	
	client.on('getProject', function(id, callback){
		var where = '1=1';
	
		if(id != -1)
		{
			where = '`project_id` = '+ id;
		}
		SQLclient.query('SELECT projects.*, employee.employee_id, employee.name '+
 						'FROM '+dbTables['projects']+' projects INNER JOIN '+dbTables['employees'] +' employee '+
						'ON projects.project_manager = employee.employee_id AND '+ where,
  						function selectCb(err, results, fields) {
    					if (err) {
      					throw err;
    					}
    					var projects = {project : results}; 
    					callback(json(projects));
    				});
	
	
	});
	
	client.on('createSession', function(data, callback) {
		var leader = myID;
		var session = new Session(sessions.length, data.name, data.public, data.bidirectional, leader, data.currentPage, data.chatOnly);
		addUserToSession(client, users[myID], session);
		sessions.push(session);
		socket.sockets.emit('newSessionActive', json({name: data.name, isPublic: data.public}));
		callback(data);
	
	});
	
	client.on('getActiveSessions', function(data, callback){
	
		//console.log(json(sessions));
		callback(json({session: sessions}));
	
	});
	
	client.on('generateReport', function(id, callback){
		var where = 'timesheet.employee_id = '+ myID;
	
		if(id != -1)
		{
			where = 'timesheet.employee_id = '+ id;
		}
		SQLclient.query('SELECT timesheet.*, employee.*, tasks.id, tasks.task_name, projects.project_id, projects.project_name '+
 						'FROM '+dbTables['employees']+' employee INNER JOIN '+dbTables['timesheets'] +' timesheet '+
						'ON employee.employee_id = timesheet.employee_id '+
						'INNER JOIN '+dbTables['tasks'] +' tasks '+
						'ON timesheet.task_id = tasks.id '+
						'INNER JOIN '+dbTables['projects'] +' projects '+
						'ON timesheet.project_id = projects.project_id '+
						'WHERE '+ where +' AND timesheet.approved = 0', 
  						function selectCb(err, results, fields) {
    					if (err) {
      					throw err;
    					}
    					var report = {timesheets : results}; 
    					callback(json(report));
    				});
	
	
	});
	
	client.on('getSessionID', function(){
	
		client.emit('getSessionID', users[myID].getSessionID());
	
	});
	
	client.on('getTimesheets', function(id, callback){
	
		var where = 'timesheet.employee_id = '+ myID;
	
		if(id != -1)
		{
			where = 'timesheet.employee_id = '+ id;
		}
		SQLclient.query('SELECT timesheet.*, employee.employee_id, employee.name, tasks.id, tasks.task_name, projects.project_id, projects.project_name '+
 						'FROM '+dbTables['timesheets']+' timesheet INNER JOIN '+dbTables['employees'] +' employee '+
						'ON timesheet.project_manager = employee.employee_id '+
						'INNER JOIN '+dbTables['tasks'] +' tasks '+
						'ON timesheet.task_id = tasks.id '+
						'INNER JOIN '+dbTables['projects'] +' projects '+
						'ON timesheet.project_id = projects.project_id '+
						'WHERE '+ where, 
  						function selectCb(err, results, fields) {
    					if (err) {
      					throw err;
    					}
    					console.log(results);
    					var timesheets = {timesheet : results}; 
    					callback(json(timesheets));
    				});
	
	
	});
	
	client.on('getTasks', function(callback){
	
		SQLclient.query('SELECT *'+
 						'FROM '+dbTables['tasks'],
  						function selectCb(err, results, fields) {
    					if (err) {
      					throw err;
    					}
    					var tasks = {task : results}; 
    					callback(json(tasks));
    				});
	
	
	});
	
	// replace with 'trigger' clicks, sent from client, server sends back to other clients
	
	client.on('triggerClick', function(triggeredObject){
	
		//console.log('triggering '+ triggeredObject +' to '+ users[myID].getSession().getName());
		if(users[myID].getSession() != null)
		{
			var theSession = users[myID].getSession();
			if((theSession.isBidirectional() || theSession.getLeader() == myID) && !theSession.isChatOnly())
			{
				client.broadcast.to(theSession.getName()).emit('triggerClick', triggeredObject.object);
				theSession.setCurrentPage(triggeredObject.newPage);
			}
		}
		//client.emit('triggerClick', triggeredObject);
	
	
	});
	
	// TODO: Merge these into one method 
	client.on('textboxFocus', function(textbox){
		var date = new Date()
	
		changeLog.info('Started Editing', {date: date.toUTCString(), userID: myID, userName: users[myID].getName(), inputID: textbox.id, initValue: textbox.value});
		if(users[myID].getSession() != null)
		{
			client.broadcast.to(users[myID].getSession().getName()).emit('textboxHasFocus', json(textbox));
		}
	});
	
	client.on('textboxTyped', function(textbox){
		//console.log("TYPED: "+ textbox.id + " "+ textbox.value);
		if(users[myID].getSession() != null)
		{
			client.broadcast.to(users[myID].getSession().getName()).emit('textboxTyped', json(textbox));
		}
	});
	
	client.on('textboxBlur', function(textbox){
	
		changeLog.info('User '+ users[myID].getName() +' finished editing '+ textbox.id +' which now has a value of '+ textbox.value);
		if(users[myID].getSession() != null)
		{
			client.broadcast.to(users[myID].getSession().getName()).emit('textboxLostFocus', json(textbox));
		}
	});
	
	client.on('setUserID', function(id){
		myID = id;
		if(typeof myID !== "undefined")
		{
			console.log('defined');
		
			getUsername(myID, function(username){
			
		
				if((typeof myID !== "undefined") && myID !== null && !userIsInArray(myID))
				{
					
					users[myID] = new User(myID, username, 'true', client.handshake.sessionID);
				}
				else
				{
				}
			
			
			});
		}
	});
	 
	client.on('getUsers', function(callback){
	
		//console.log('getUsers called')
		callback(getUsers());
		
	
	});
	
	client.on('logOut', function(){
		if(users[myID] !== null)
		{
			client.leave('/'+client.handshake.sessionID);
		}
		users.splice(myID, 1);		
	
	});
	
});

function getUserLevel(userID)
{
	return 1;
}

function userIsInArray(userID)
{
	for(var u in users)
	{
		if(users[u].getId() == userID)
		{
			return true;
		}
	}
	
	return false;

}

function getUsername(userID, callback)
{
	if(typeof userID !== "undefined")
	{
		SQLclient.query(
  						'SELECT `name` FROM '+EMPLOYEE_TABLE+' WHERE `employee_id` = '+userID ,
  						function selectCb(err, results, fields) {
    					if (err) {
      					throw err;
    					}
    					callback(results[0]['name']);
    				});
    }
    
    else
    	callback('Error');
}

function getSession(sessionName)
{
	for(var i = 0; i < sessions.length; i++)
	{
		if(sessions[i].getName() == sessionName)
		{
			return sessions[i];
		}
	}
}

function getUsers()
{

	var onlineUsers = [];
		
	for(var u in users)
	{
		onlineUsers.push(users[u].getName());
	}
	
	return json(onlineUsers);
}

function getUserCount()
{
	
	/*var rooms = socket.sockets.manager.rooms;
	
	var count = 0;
	
	for (var key in rooms) 
	{
   		if(key != '')
   		{
   			count++;
   			console.log('Room: '+ key);
   		}
   		
	}*/
	
	var count = 0;
	for(var u in users)
	{
		count++;
	}
	
	getUsers();
	
	return count;


}
//DONE(?): Create an addUserToSession method which does the grunt work ie leave current room, set session in user object, add user to session object and joins the room
function addUserToSession(client, user, session)
{
	console.log('Session: '+session);
	if(user.getSession() != null)
	{
		var oldSession = user.getSession();
		client.leave(oldSession.getName());
		if(oldSession.userCount() == 0 && oldSession.getId() != '1')
		{
			console.log('removing old session '+ oldSession.getName());
			sessions.splice(sessions.indexOf(oldSession), 1);
			// TODO: Let clients know that a session has been deleted
		}
	}
	client.join(session.getName());
	user.setSession(session);
	session.addUser(user.getId());
}

function addUsertoArray(userID, sessionID)
{
	getUsername(userID, function(username){
	
		users[userID] = new User(userID, username, 'true', sessionID);
	
	});
	
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

function daysToMillis(days)
{
	return (days * 24 * 60 * 60 * 1000);
}
