
/**
 * Module dependencies.
 */

var express 	= 	require('express')
var routes 		= 	require('./routes')
var io			=	require('socket.io');

var app 		= 	module.exports 	= 	express.createServer();
var json 		= 	JSON.stringify;
var mysql 		= 	require('mysql');
	
//var REPORT_DATABASE 	= 	'db1104243_ernie';
var	REPORT_DATABASE = 'ernie';
var	EMPLOYEE_TABLE = 'ernie_employees';
/* var	SQLclient = mysql.createClient({
		//host: 'mysql1156.cp.blacknight.com',
  		//user: 'u1104243_ernie',
  		//password: '4thYearProject',
  		user: 'root',
  		password: 'mancity'
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
); */

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.set('view options', { pretty: true }); // Uncomment to make source look readable
  app.use(express.bodyParser());
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

app.get('/', routes.index);

app.get('/reports/:id?', routes.reports);

app.get('/main', routes.index);

app.get('/404', routes.error);


//The 404 Route (ALWAYS Keep this as the last route)
app.use(function(req,res){
    res.render('404.jade', { locals: { 
                  header: '#Header#'
                 ,footer: '#Footer#'
                 ,title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
});

app.listen(8080);
//console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

var socket = io.listen(app);
var users = {}, count = 0;
 
socket.sockets.on('connection', function(client){
	
	//users.add(client);
	count++;
	client.broadcast.emit('updateCount', count);
	console.log('New Connection, ip: '+ client.handshake.address.address);
		
	   
	client.on('disconnect', function(){
		count--;
		client.broadcast.emit('updateCount', count);
	
	});
	
	client.on('updateCount', function(){
		client.emit('updateCount', count);
	});
	
	client.on('db', function(msg){
	    msg = JSON.parse(msg)
	    /* SQLclient.query(
  						'INSERT INTO '+ EMPLOYEE_TABLE+' '+
  						'SET name = ?, position = ?, email = ?',
  						[msg.name, msg.position, msg.email], 
						  function(){ 
						  console.log('emitting update');
						  client.broadcast.emit('updatedDB', json(msg))
						  client.emit('updatedDB', json(msg))
						  }
						); */
	 });
	    
	client.on('initial', function(){
	    	/* SQLclient.query(
  						'SELECT * FROM '+EMPLOYEE_TABLE,
  						function selectCb(err, results, fields) {
    					if (err) {
      					throw err;
    					}
    					client.emit('initial', json(results));
    				}); */
	    	});
	
});
