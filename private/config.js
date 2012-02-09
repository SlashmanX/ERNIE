(function(exports){

	exports.getDBInfo = function(provider) {
	
		var dbInfo = {};
		
				dbInfo['host'] = 'localhost';
				dbInfo['user'] = 'root';
				dbInfo['db'] = 'ernie';
				dbInfo['password'] = 'mancity';
	
		switch(provider)
		{
			case 'blacknight':
				dbInfo['host'] = 'mysql1156.cp.blacknight.com';
				dbInfo['user'] = 'u1104243_ernie';
				dbInfo['db'] = 'db1104243_ernie';
				dbInfo['password'] = '4thYearProject';
			break;
			case 'localhost':
				dbInfo['host'] = 'localhost';
				dbInfo['user'] = 'root';
				dbInfo['db'] = 'ernie';
				dbInfo['password'] = 'mancity';
			break;
			case 'heroku':
				dbInfo['host'] = 'us-mm-auto-dca-01.cleardb.com';
				dbInfo['user'] = '77408e24a2062';
				dbInfo['db'] = 'heroku_3c3d586f6d78228';
				dbInfo['password'] = 'ed8a92b5';
			break;	
			default:
				dbInfo['host'] = 'localhost';
				dbInfo['user'] = 'root';
				dbInfo['db'] = 'ernie';
				dbInfo['password'] = 'mancity';
			break;
			
				
		}
		
		return (JSON.stringify(dbInfo));
	
	
	
	}
	
	exports.getDBTables = function() {
	
		var dbTables = {};
		
		dbTables['employees'] = 'ernie_employees';
		dbTables['projects'] = 'ernie_projects';
		dbTables['tasks'] = 'ernie_timesheet_categories';
		dbTables['timesheets'] = 'ernie_timesheet_entries';
		
		return (JSON.stringify(dbTables));
	
	
	
	}

})(typeof exports === 'undefined'? this['functions']={}: exports);