var url = [location.protocol, '//', location.host].join('');
var socket = io.connect(url);

var scripts = [];

var notifications;


$(document).ready(function() {

	
	var url = [location.protocol, '//', location.host].join('');
	var path = location.pathname;
	if(path.substr(-1) != '/') {
        path+= '/';
        var stateObj = { activePage:  path};
		history.replaceState(stateObj, "ERNIE", url + path);

    }
	if(path == '/' || path == '/index.html')
	{
		var stateObj = { activePage:  'main'};
		history.pushState(stateObj, "ERNIE", '/');
		path = 'main';
	}
	if (!$('body').hasClass('login')) {
       var active = updatePage(path);
    }
	
	//$.inlog(true);
	initSocketFunctions();
	bindMenus();

	
	
	$('#loginForm').on('submit', function(e) {
		e.preventDefault();
		processLogin();
	
	
	});
	
	
	
	$('#loginButton').live('click', function(e) {
		e.preventDefault();
		processLogin();
	
	});

});



function processLogin()
{
	var path = location.pathname;
	//alert('logging in');
	$('#loginText').Loadingdotdotdot({'loadString': 'Logging In', 'maxDots': 3});
	//alert('logging in');
	
	var dataString = 'username='+ $('input#username').val() + '&password=' + functions.sha1($('input#password').val());
  	$.ajax({
  		type: "POST",
    	url: "/login",
	    data: dataString,
	    success: function(data) {
	    	if(data != '-1')
	    	{
		    	$.cookie('loggedin', 'true', { expires: 1, path: '/' });
		    	$('.outer').load('/ .outer', function(response, status, xhr){
		    		loadScripts(function(){
		    			var stateObj = { activePage:  'login'};
						history.pushState(stateObj, "ERNIE", path);
						updatePage(path, function(status){
							$('#loginText').Loadingdotdotdot("Stop");
							bindMenus();
							initSocketFunctions();
							socket.emit('setUserID', data);
							socket.emit('updateCount');
						});
					});
				});
			}
			
			else
			{
				var infoParent = $('#infotext').parent();
				$('#loginText').Loadingdotdotdot("Stop");
				infoParent.removeClass('information');
				infoParent.addClass('attention');
				$('#loginText').text('Error logging in. Please try again.');
			}
			
      	}
	  });
}
function bindMenus()
{
	notifications = $('body').ttwSimpleNotifications()
	
	$('ul.nav:not(#user) a').on('click', function(e, from) {
	
		e.preventDefault();
		if(from != 'server')
		{
			var thisTrigger = '#'+$(this).parent('li').attr('id') + ' a';
    	
    		socket.emit('triggerClick', thisTrigger);

		}
		
    	
		var newUrl = $(this).attr('href');
		var stateObj = { activePage:  newUrl};
		history.pushState(stateObj, "ERNIE", newUrl);
		updatePage(newUrl);
		$('.active').removeClass('active');
		$(this).parent('li').addClass('active');
	
	});
	$("ul.nav#user li:not(.dropdown):not(#userLogOut):not(#sessionStart) a").on('click',function(e, from) {
    	e.preventDefault();
    	var newUrl = $(this).attr('href');
		
		
		var stateObj = { activePage:  newUrl};
		history.pushState(stateObj, "ERNIE", newUrl);
		if(from != 'server')
		{
			var thisTrigger = '#'+$(this).parent('li').attr('id') + ' a';
    	
    		socket.emit('triggerClick', thisTrigger);

		}
		var activeDiv = updatePage(newUrl);
		
		
		$('.active').removeClass('active');
		$(this).parent('li').addClass('active');
		$(this).parentsUntil('li .dropdown').parent('li').addClass('active');
	
	});
	
	$('#userCount').on('click', function(e) {
		e.preventDefault();
		showOnlineUsers();
	
	});
	
	$('#createRoom').on('click', function(e) {
		e.preventDefault();
		var roomName = $('#newRoomName').val();
		socket.emit('createRoom', roomName)
	
	})
	
	$('#sessionStart').on('click', function(e) {
		e.preventDefault();
		$('#sessionIDModal').modal('show')
		socket.emit('getSessionID');
		socket.on('getSessionID', function(sessionID){
		
		
			$('#sessionURL').val(url + '/s/'+sessionID+'/');
			$('#sessionURL').focus();
    		$('#sessionURL').select();
		});
	
	});
	
	$('#userLogOut').on('click', function(e) {
		e.preventDefault();
		$.cookie('loggedin', 'false', { expires: 1, path: '/' });
		socket.emit('logOut');
		showHideMenus();
		updatePage('main');
		var stateObj = { activePage:  'main'};
		history.pushState(stateObj, "ERNIE", '/');
	
	});
	
	/*$('body').on('focus', 'input', function(e) {
		socket.emit('textboxFocus', {id: $(this).attr('id'), initValue: $(this).val()});
	
	});
	
	$('body').on('keyup', 'input', function() {
		socket.emit('textboxTyped', {id: $(this).attr('id'), value: $(this).val()});
	});
	
	$('body').on('blur', 'input', function(e) {
		console.log('blur: '+ $(this).val());
		socket.emit('textboxBlur', {id: $(this).attr('id'), value: $(this).val()});
	
	})*/
	
}


function initSocketFunctions()
{
	socket.on('connect', function() {
		socket.emit('updateCount');
		//socket.emit('joinSession', 'test');
	    console.log('Connected!');
	    
	});
	
	socket.on('createRoom', function(newRoom) {
	
		$('#newRoomName').val(url + '/s/'+newRoom+'/').focus().select();
		$('#createRoom').hide();
	
	})
		
	socket.on('updateCount', function(count) {
		$('#onlineUsers').text(count).hide().fadeIn('slow');
	
	});
	
	socket.on('textboxLostFocus', function(textbox) {
		textbox = JSON.parse(textbox);
		$('input#'+textbox.id).val(textbox.value);
		$('input#'+textbox.id).attr('readonly', false);
	
	});
	
	socket.on('textboxTyped', function(textbox) {
		textbox = JSON.parse(textbox);
		$('input#'+textbox.id).val(textbox.value);
	
	});
	
	socket.on('textboxHasFocus', function(textbox) {
		textbox = JSON.parse(textbox);
		$('input#'+textbox.id).attr('readonly', true);
	
	});
	
	socket.on('updatedDB', function(msg) {
		//alert(msg);
		msg = JSON.parse(msg);
		//alert("Updated");
	   $('#database').append("<li style ='display: none;'>"+msg.name +"</li>")
	   $('#database li:last').slideDown('slow');
	   
		document.title = 'New Employee';
	   
	});

	
	socket.on('disconnect', function() {
	    console.log('Disconnected!');
	});
	
	socket.on('notification', function(msg) {
	    notifications.show(msg);
	});
	
	socket.on('triggerClick', function(tObject) {
		console.log('got Trigger');
		$(tObject).trigger('click', ['server']);	
	
	});
}
function loadScripts(callback)
{
	callback();
}

function showHideMenus()
{
	$('.forceLogIn').toggle();

}

function showOnlineUsers()
{
	$('#onlineUsersModal').modal('show')
	socket.emit('getUsers');
	socket.on('getUsers', function(UserArray){
	
		var usersOnline = '';
		
		UserArray.replace(/[^a-zA-Z 0-9]+/g,'');
		
		var UsersArray = UserArray.split(',');
		
		for(var i = 0; i < UsersArray.length; i++)
		{
			var username = UsersArray[i].replace(/[^a-zA-Z 0-9]+/g,'');
			if(username != '')
				usersOnline = usersOnline  + username + '<hr/>';
		}
		
		//alert(usersOnline)
		
		$('.modal-body p').html(usersOnline);
	});
}

function showLoadingBar()
{
	var loadingID = $('#loading');
	//$.getScript("/javascripts/jquery.loadingdotdotdot.js", function() {
		loadingID.Loadingdotdotdot({});
		loadingID.css("top", 10);
		loadingID.css("left",($(window).width() /2) - ($('#loading').width() /2));
		loadingID.show();
    //});
	
}

function hideLoadingBar()
{
	//$.getScript("/javascripts/jquery.loadingdotdotdot.js", function() {
		$('#loading').Loadingdotdotdot("Stop");
		$('#loading').fadeOut('slow');
	//});
}

function PageIsHidden()
{
	return document.hidden || document.msHidden || document.webkitHidden;
}
	
function visibilityChanged()
{
	if(PageIsHidden()){
		document.title = "I'm hidden";
	}
	else
	{
		document.title = "ERNIE Admin Panel";
	}
}

function updateBreadCrumbs(origURL)
{
	newURL = origURL.split('/');
	page = newURL[1];
	action = newURL[2];
	var i;
	var updated = '';
	if(origURL != 'error')
	{
		if (origURL != 'main')
		{
			for(i = 1; i < newURL.length - 2; i++)
			{
				//alert('for '+ i);
				updated += '<a href="/'+ newURL[i] +'/">'+capitaliseFirstLetter(newURL[i])+'</a><div class="breadcrumb_divider"></div>';
			}
			//alert('i after '+ i )
			updated += '<a class="current">'+capitaliseFirstLetter(newURL[i])+'</a>';
		
			
		}
		
		else
		{
			updated += '<a class="current">Dashboard</a>';
		}
	}
	
	else
	{
		updated += '<a class="current">Error</a>';
	}
	
	$('#newBreadcrumbs').html(updated);
		
}

function updatePage(DivUrl, callback)
{
	var offset = $(window).offset();
	showLoadingBar();
	var newPage;
	var action;
	var activeArea = 'main';
	
	if (DivUrl == 'main' || DivUrl == '/')
	{
		newPage = 'main';
		activeArea = 'content';
		
	}
	else if(DivUrl == '/graphs/')
	{
		newPage = 'graphs';
		activeArea = 'content';
	}
	else
	{
		var splitUrl = DivUrl.split('/');
		newPage = splitUrl[1];
		action = splitUrl[2];
		activeArea = newPage +"_"+ action;
		
	}
		
	$('.content').load('/'+ newPage +'/ .content > *', function(response, status, xhr){
			if (status != "error") {
				updateBreadCrumbs(DivUrl);
				$.getScript("/javascripts/"+newPage+".js", function(){});
			}
			else {
				$('.content').load('/404/ .content');
				updateBreadCrumbs('error');
			}
			hideLoadingBar();
			callback(status);
			
	});
}

function capitaliseFirstLetter(string)
{
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function parse_date(oldDate) {
	oldDate = oldDate.replace('T', ' ');
    var dateParts = oldDate.split(/[- :]/);
    
	var jsDate = dateParts[2] +'/'+ dateParts[1] +'/'+ dateParts[0];  
  
    return jsDate;  
} 

function replaceAll(txt, replace, with_this) {
  return txt.replace(new RegExp(replace, 'g'),with_this);
}


function pause(millis) 
{
        var date = new Date();
        var curDate = null;
 
        do { curDate = new Date(); } 
        while(curDate-date < millis)
}
