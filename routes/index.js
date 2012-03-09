
/*
 * GET home page.
 */

exports.index = function(req, res){
  console.log('Logged in? '+ req.cookies.loggedin);
  res.render('main', { title: 'Express' })
};

exports.main = function(req, res){
  res.render('main', { title: 'Express'})
};


exports.reports = function(req, res){
  res.render('reports', { title: 'Reports'})
};

exports.projects = function(req, res){
  res.render('projects', { title: 'Projects'})
};

exports.timesheets = function(req, res){
  res.render('timesheets', { title: 'Timesheets'})
};

exports.session = function(req, res){
  var sessionID = req.params.sessionid;
  res.render('s', { title: 'Sessions'})
};


exports.graph = function(req, res){
  res.render('graphs', { title: 'Graphs'})
};

exports.error = function(req, res){
  res.render('404', { title: '404 Error'})
};