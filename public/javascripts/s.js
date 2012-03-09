$(document).ready(function() {
	$('#infoText').Loadingdotdotdot({'loadString': 'Joining Session', 'maxDots': 3});
	var path = location.pathname;
	var sessionID;
	var path = path.split('/');
	if(path.length == 4 && path[2] != 'all')
	{
		sessionID = path[2];
	}
	
	socket.emit('joinSession', sessionID);
});