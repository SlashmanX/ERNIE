
/**
 * Module dependencies.
 */

var express 	= 	require('express')
var routes 		= 	require('./routes')
var io			=	require('socket.io');
var connect		=	require('connect');
var classjs 	= 	require('./public/javascripts/class.js');
var functions 	= 	require('./public/javascripts/functions.js');
var	private		=	require('./private/config.js');
var mysql 		= 	require('mysql');
var	winston		=	require('winston');

var app         =   module.exports  =   express.createServer();
var json        =   JSON.stringify;
var	users		=	[];

var parseCookie =   connect.utils.parseCookie;

var port 		= 	process.env.PORT || 13476;
var	dbInfo		=	JSON.parse(private.getDBInfo(''));
var	dbTables	=	JSON.parse(private.getDBTables());

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
var	REPORT_DATABASE		=	dbInfo['db'];
var	EMPLOYEE_TABLE		=	dbTables['employees'];


var	SQLclient = mysql.createClient({

		// BLACKNIGHT
		host: dbInfo['host'],
  		user: dbInfo['user'],
  		password: dbInfo['password'],
		});

SQLclient.query('CREATE DATABASE '+REPORT_DATABASE, function(err) {
  if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
    throw err;
  }
});
SQLclient.query('USE '+REPORT_DATABASE);

SQLclient.query('CREATE TABLE IF NOT EXISTS ernie_employees ('+
   '`employee_id` int(11) not null,'+
   '`name` varchar(255),'+
   '`position` text,'+
   '`email` text,'+
   '`username` varchar(255) not null,'+
   '`level` int(2) not null default "1",'+
   '`password` varchar(255),'+
   '`last_login` datetime,'+
   '`oauth_token` varchar(255),'+
   '`oauth_token_secret` varchar(255),'+
   'PRIMARY KEY (`employee_id`)'+
') ENGINE=MyISAM DEFAULT CHARSET=latin1;'
);

SQLclient.query("INSERT IGNORE INTO `ernie_employees` (`employee_id`, `name`, `position`, `email`, `username`, `level`, `password`, `last_login`, `oauth_token`, `oauth_token_secret`) VALUES "+
"('1', 'Eoin Martin', 'Software Engineer', 'eoinmartin3007@gmail.com', 'emartin', '1', 'f1af63ecc773ae116adc40924d8ace107d6766e7', '', '', ''),"+
"('2', 'Ryan Craven', 'Software Engineer', 'ryan@cpttremendous.com', '', '1', '', '', '', ''),"+
"('3', 'Shane Dowdall', 'Supervisor', 'shane.dowdall@dkit.ie', '', '1', '', '', '', ''),"+
"('4', 'Dermot Hannan', 'CEO', 'dhannan@brandttechnologies.com', '', '1', '', '', '', ''),"+
"('5', 'Anthony McCann', 'Software Engineer', 'anthony.mccann90@gmail.com', 'amccann', '1', '412c685c48b297ef568d4f0423e5d300a5f0345f', '', '', '');"
);

SQLclient.query('CREATE TABLE IF NOT EXISTS `ernie_projects` ('+
   '`project_id` int(11) not null,'+
   '`project_name` varchar(255),'+
   '`project_manager` int(4) not null,'+
   'PRIMARY KEY (`project_id`)'+
') ENGINE=MyISAM DEFAULT CHARSET=latin1;'
	
);

SQLclient.query("INSERT IGNORE INTO `ernie_projects` (`project_id`, `project_name`, `project_manager`) VALUES ('2011114', 'ThirdForce Arabic', '1'),('2010159', 'BOE KidDesk', '2');"
);

SQLclient.query('CREATE TABLE IF NOT EXISTS `ernie_timesheet_categories` ('+
   '`id` smallint(4) not null auto_increment,'+
   '`name` varchar(255),'+
   '`db_name` varchar(255),'+
   '`parent` smallint(4) not null default "0",'+
   'PRIMARY KEY (`id`)'+
') ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=9;'
);

SQLclient.query("INSERT IGNORE INTO `ernie_timesheet_categories` (`id`, `task_name`, `db_name`, `parent`) VALUES "+
	"('1', 'Software Engineering', 'software_engineering', '0'),"+
	"('2', 'Code Review', 'code_review', '1'),"+
	"('3', 'Database Development', 'db_dev', '1'),"+
	"('4', 'Software QA', 'software_qa', '0'),"+
	"('5', 'QA Script Generation', 'qa_script_gen', '4'),"+
	"('6', 'QA Functional Automated', 'qa_funct_auto', '4'),"+
	"('7', 'Absent', 'absent', '0'),"+
	"('8', 'Bank Holiday', 'bank_holiday', '7'),"+
	"('9', 'Holiday', 'holiday', '7');"
);

SQLclient.query('CREATE TABLE IF NOT EXISTS `ernie_timesheet_entries` ('+
   '`timesheet_id` int(11) not null auto_increment,'+
   '`project_id` int(11),'+
   '`employee_id` int(11),'+
   '`task_id` int(11),'+
   '`duration` decimal(10,0),'+
   '`date_worked` date not null,'+
   'PRIMARY KEY (`timesheet_id`)'+
') ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=6;'
);

/*SQLclient.query("INSERT IGNORE INTO `ernie_timesheet_entries` (`timesheet_id`, `project_id`, `employee_id`, `task_id`, `duration`, `date_worked`) VALUES "+
	"('1', '1', '1', '2', '4', '0000-00-00'),"+
	"('2', '1', '2', '3', '2', '0000-00-00'),"+
	"('3', '2', '1', '5', '3', '0000-00-00'),"+
	"('4', '2', '2', '6', '6', '0000-00-00'),"+
	"('5', '1', '1', '7', '5', '0000-00-00');"
);*/

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
    if(req.cookies.loggedin == 'true' && (typeof req.cookies.userid !== "undefined") && (typeof users[req.cookies.userid] !== null))
    {
    	console.log('got cookies'+ req.cookies.userid);
	   	return users[req.cookies.userid].getName();
	}
	
	console.log('Cookies are null');
	
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
	console.log('post form: '+ username +'; '+ password);
	
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
        for (var key in data.cookie) 
        {
   			var obj = data.cookie[key];
      		console.log('Cookie: '+ key + ' = ' + obj);
		}
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

	console.log('connection');
	var myID = client.handshake.userID;
	console.log('userID Socket: '+ myID);
	if(typeof myID !== "undefined")
	{
		console.log('defined');
	
		getUsername(myID, function(username){
		
	
			if((typeof myID !== "undefined") && myID !== null && !userIsInArray(myID))
			{
				console.log('new user');
				
				users[myID] = new User(myID, username, 'true', client.handshake.sessionID);
			}
			else
			{
				console.log('User returning: '+ myID + ' '+ username);
				users[myID].addSession();
			}
			
			
	
			client.join(client.handshake.sessionID);
			var date = new Date()
			accessLog.info('User connected', {date: date.toUTCString(), userID: myID, userName: users[myID].getName()});
			client.broadcast.emit('updateCount', getUserCount());
			client.emit('updateCount', getUserCount());
		
		
		});
	}
	//console.log('New Connection, ip: '+ client.handshake.address.address);
		
	   
	client.on('disconnect', function(){
		console.log('disconnected');
		/*if(users[myID] !== null)
		{
			console.log(myID +' before sessions: '+ users[myID].sessionCount());
		}
		client.leave('/'+client.handshake.sessionID);
		users[myID].removeSession();
		console.log(myID +' sessions: '+ users[myID].sessionCount());
		if(users[myID].sessionCount() == 0)
		{
			console.log('removing');
			users.splice(myID, 1); // Remove it if really found
		}*/
		client.broadcast.emit('updateCount', getUserCount());
	
	});
	
	client.on('getGraph', function(id){
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
    					client.emit('getGraph', json(tasks));
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
    					console.log(results);
    					var projects = {project : results}; 
    					callback(json(projects));
    					
    					client.emit('graphReady');
    				});
	
	});
	
	client.on('graphReady', function(){
	
		client.emit('graphReady');
	
	})
	
	client.on('updateCount', function(){
		client.emit('updateCount', getUserCount());
	});
	
	client.on('joinSession', function(sessionID){
		client.join(sessionID);
		users[myID].setRoomName(sessionID);
		client.broadcast.to(sessionID).emit('notification', users[myID].getName() +' has joined your session');
	
	})
	
	client.on('getProject', function(id){
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
    					client.emit('getProject', json(projects));
    				});
	
	
	});
	
	client.on('createRoom', function(newRoom) {
		
		client.join(newRoom);
		users[myID].setRoomName(newRoom);
		client.emit('createRoom', newRoom);
	
	});
	
	client.on('generateReport', function(id){
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
						'WHERE '+ where +' AND timesheet.approved = 1', 
  						function selectCb(err, results, fields) {
    					if (err) {
      					throw err;
    					}
    					var report = {timesheets : results}; 
    					client.emit('generateReport', json(report));
    				});
	
	
	});
	
	client.on('getSessionID', function(){
	
		client.emit('getSessionID', users[myID].getSessionID());
	
	});
	
	client.on('getTimesheets', function(id){
	
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
    					client.emit('getTimesheets', json(timesheets));
    				});
	
	
	});
	
	client.on('getTasks', function(){
	
		SQLclient.query('SELECT *'+
 						'FROM '+dbTables['tasks'],
  						function selectCb(err, results, fields) {
    					if (err) {
      					throw err;
    					}
    					var tasks = {task : results}; 
    					client.emit('getTasks', json(tasks));
    				});
	
	
	});
	
	// replace with 'trigger' clicks, sent from client, server sends back to other clients
	
	client.on('triggerClick', function(triggeredObject){
	
		console.log('triggering '+ triggeredObject +' to '+ users[myID].getRoomName());
		
		
	
		client.broadcast.to(users[myID].getRoomName()).emit('triggerClick', triggeredObject);
		//client.emit('triggerClick', triggeredObject);
	
	
	});
	
	client.on('textboxFocus', function(textbox){
		var date = new Date()
	
		changeLog.info('Started Editing', {date: date.toUTCString(), userID: myID, userName: users[myID].getName(), inputID: textbox.id, initValue: textbox.value});
		
		client.broadcast.to(users[myID].getRoomName()).emit('textboxHasFocus', textbox);
	});
	
	client.on('textboxTyped', function(textbox){
		//console.log("TYPED: "+ textbox.id + " "+ textbox.value);
		
		client.broadcast.to(users[myID].getRoomName()).emit('textboxTyped', json(textbox));
	});
	
	client.on('textboxBlur', function(textbox){
	
		changeLog.info('User '+ users[myID].getName() +' finished editing '+ textbox.id +' which now has a value of '+ textbox.value);
		
		client.broadcast.to(users[myID].getRoomName()).emit('textboxLostFocus', json(textbox));
	});
	
	client.on('setUserID', function(id){
		myID = id;
		if(typeof myID !== "undefined")
		{
			console.log('defined');
		
			getUsername(myID, function(username){
			
		
				if((typeof myID !== "undefined") && myID !== null && !userIsInArray(myID))
				{
					console.log('new user');
					
					users[myID] = new User(myID, username, 'true', client.handshake.sessionID);
				}
				else
				{
					console.log('User returning: '+ myID + ' '+ username);
					users[myID].addSession();
				}
			
			
			});
		}
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
	
	client.on('logOut', function(){
		if(users[myID] !== null)
		{
			client.leave('/'+client.handshake.sessionID);
		}
		users.splice(myID, 1);		
	
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
    					console.log('username SQL: '+results[0]['_name']);
    					callback(results[0]['name']);
    				});
    }
    
    else
    	callback('Error');
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

function addUsertoArray(userID, sessionID)
{
	console.log('UserID: ' + userID);
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
var User = Class.extend({
	init 		: function(id, name, loggedIn, sessionID) {
			this.id 			= 	id;
			this.name 			= 	name;
			this.loggedIn 		= 	loggedIn;
			this.sessionID		=	sessionID;
			this.roomName		=	'test';
			this.numSessions	=	0;
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
    addSession	:	function(){
    		this.numSessions++;
    },
    removeSession	:	function(){
    		this.numSessions--;
    },
    sessionCount	:	function(){
    		return this.numSessions;
    },
    setRoomName		:	function(roomName){
    		this.roomName = roomName;
    
    },
    getRoomName		:	function(){
    		return this.roomName;
    
    }
    
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
