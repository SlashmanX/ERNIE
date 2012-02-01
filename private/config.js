(function(exports){

	exports.getDBInfo = function(provider) {
	
		var dbInfo = {};
		
				dbInfo['host'] = 'localhost';
				dbInfo['user'] = 'root';
				dbInfo['db'] = 'ernie';
				dbInfo['password'] = 'mancity';
				dbInfo['employeeDB'] = 'ernie_employees';
	
		switch(provider)
		{
			case 'blacknight':
				dbInfo['host'] = 'mysql1156.cp.blacknight.com';
				dbInfo['user'] = 'u1104243_ernie';
				dbInfo['db'] = 'db1104243_ernie';
				dbInfo['password'] = '4thYearProject';
				dbInfo['employeeTable'] = 'ernie_employees';
			break;
			case 'localhost':
				dbInfo['host'] = 'localhost';
				dbInfo['user'] = 'root';
				dbInfo['db'] = 'ernie';
				dbInfo['password'] = 'mancity';
				dbInfo['employeeTable'] = 'ernie_employees';
			break;
			case 'heroku':
				dbInfo['host'] = 'us-mm-auto-dca-01.cleardb.com';
				dbInfo['user'] = '77408e24a2062';
				dbInfo['db'] = 'heroku_3c3d586f6d78228';
				dbInfo['password'] = 'ed8a92b5';
				dbInfo['employeeTable'] = 'ernie_employees';
			break;	
			default:
				dbInfo['host'] = 'localhost';
				dbInfo['user'] = 'root';
				dbInfo['db'] = 'ernie';
				dbInfo['password'] = 'mancity';
				dbInfo['employeeTable'] = 'ernie_employees';
			break;
			
				
		}
		
		return (JSON.stringify(dbInfo));
	
	
	
	}

})(typeof exports === 'undefined'? this['functions']={}: exports);