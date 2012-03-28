
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('main', { title: 'Home | ERNIE' })
};

exports.main = function(req, res){
  res.render('main', { title: 'Home | ERNIE'})
};


exports.reports = function(req, res){
  res.render('reports', { title: 'Reports | ERNIE'})
};

exports.projects = function(req, res){
  res.render('projects', { title: 'Projects | ERNIE'})
};

exports.timesheets = function(req, res){
  res.render('timesheets', { title: 'Timesheets | ERNIE'})
};

exports.session = function(req, res){
  var sessionID = req.params.sessionid;
  res.render('s', { title: 'Sessions | ERNIE'})
};


exports.graph = function(req, res){
  res.render('graphs', { title: 'Graphs | ERNIE'})
};

exports.error = function(req, res){
  res.render('404', { title: '404 Error | ERNIE'})
};