$(document).ready(function() {
	sBind();
});

function sBind()
{
	$('#infoText').Loadingdotdotdot({'loadString': 'Joining Session', 'maxDots': 3});
	var path = location.pathname;
	var sessionID;
	var path = path.split('/');
	if(path.length == 4 && path[2] != 'all')
	{
		sessionID = decodeURIComponent(path[2]);
	}
	socket.emit('joinSession', sessionID, function(newSession){
		var session = JSON.parse(newSession);
		joinNewSession(newSession);
		updatePage(session.newUrl);
	});
}