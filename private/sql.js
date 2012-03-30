SQLclient.query('CREATE DATABASE '+REPORT_DATABASE, function(err) {
  if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
    throw err;
  }
});

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