var url = [location.protocol, '//', location.host].join('');
var socket = io.connect(url);

var scripts = [];

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

	
	
	$('#loginForm').one('submit', function(e) {
		e.preventDefault();
		processLogin();
	
	
	});
	
	
	
	$('#loginButton').live('click', function(e) {
		e.preventDefault();
		processLogin();
	
	});
	
	
	/*$(window).bind('popstate', function(event) {
  		var state = event.originalEvent.state;

  		if(state)
  		{	
    		updatePage(state.activePage);
    		//alert("After Scroll");
    	}
	});*/
	
	/*document.addEventListener("visibilitychange", visibilityChanged);
    document.addEventListener("webkitvisibilitychange", visibilityChanged);
    document.addEventListener("msvisibilitychange", visibilityChanged);*/
    
    
	
	
	/*var menuYloc = $('.nav').offset().top;
	$('.nav').css({top:menuYloc});
	console.log('Y: '+ menuYloc);
    $(window).scroll(function () { 
    	var topPx = $(document).scrollTop();
    	
    	if(topPx > menuYloc)
    	{
        	var offset = topPx + "px";  
        	$('.nav').animate({top:offset},{duration:1000,queue:false});
        }
        else
        {
        	$('.nav').animate({top:menuYloc},{duration:1000,queue:false});
        }
        
    });*/

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
	$('#home').on('click', function(e) {
	
		e.preventDefault();
		var stateObj = { activePage:  'main'};
		history.pushState(stateObj, "ERNIE", '/');
		updatePage('main');
		$('.active').removeClass('active');
		$(this).addClass('active');
	
	});
	$("ul.nav:not(.nav-tabs) li:not(.dropdown):not(#home):not(#userLogOut)").on('click',function(e) {
    	e.preventDefault();
		var action = ($(this).find('a:first').text()).toLowerCase();
		var what = $(this).parentsUntil('li.dropdown').parent().parent().attr('id');
		var newUrl = "/"+what +"/"+action+"/";
		
		
		var stateObj = { activePage:  what};
		history.pushState(stateObj, "ERNIE", newUrl);
		socket.emit('changePage', newUrl);
		var activeDiv = updatePage(newUrl);
		$('.active').removeClass('active');
		$(this).addClass('active');
		$(this).parentsUntil('li .dropdown').parent('li').addClass('active');
	
	});
	
	$('#userCount').on('click', function(e) {
		e.preventDefault();
		showOnlineUsers();
	
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
}


function initSocketFunctions()
{
	socket.on('connect', function() {
		socket.emit('updateCount');
	    console.log('Connected!');
	    
	});
		
	socket.on('updateCount', function(count) {
		$('#onlineUsers').text(count).hide().fadeIn('slow');
	
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
	
	socket.on('changePage', function(url) {
		//alert ('changing page to '+ url);
		var stateObj = { activePage:  url};
		history.pushState(stateObj, "ERNIE", url);
		//path = 'main';
		var page = updatePage(url);
		
	
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
		
		$('.modal-body').html(usersOnline);
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
				$.getScript("/javascripts/jquery.scrollTo-1.4.2.min.js", function() {
					$(window).scrollTo('.'+activeArea, 800, {offset: {top:-60, left:0}});
				});
				$.getScript("/javascripts/"+newPage+".js", function(){});
			}
			else {
				$('.content').load('/404/ .content');
				updateBreadCrumbs('error');
				$.getScript("/javascripts/jquery.scrollTo-1.4.2.min.js", function() {
					$(window).scrollTo(0, 800);
				});
			}
			hideLoadingBar();
			callback(status);
			
	});
}

function capitaliseFirstLetter(string)
{
	return string.charAt(0).toUpperCase() + string.slice(1);
}

