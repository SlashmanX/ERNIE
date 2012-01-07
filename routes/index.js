
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

exports.error = function(req, res){
  res.render('404', { title: '404 Error'})
};