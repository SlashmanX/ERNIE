var url = [location.protocol, '//', location.host].join('');
var socket = io.connect(url);


$(document).ready(function() {
	var url = [location.protocol, '//', location.host].join('');
	var path = location.pathname;
	if(path == '/' || path == '/index.html')
	{
		var stateObj = { activePage:  'main'};
		history.pushState(stateObj, "ERNIE", '/');
		path = 'main';
	}
	if (!$('body').hasClass('login')) {
       var active = updatePage(path);
    }
    
    $.inlog(true);
    
    $('#onlineUsersModal').modal({
  			keyboard: true,
  			backdrop: true,
  			show: false
	})
	
	
	
	socket.on('connect', function() {
		socket.emit('initial');
		socket.emit('updateCount');
	    console.log('Connected!');
	    
	});
	
	socket.on('initial', function(msg) {
			msg = JSON.parse(msg);
			//alert(msg);
			
			$('#database li').remove();
			
			for (result in msg) 
			{
				if(msg[result].numUsers == undefined)
				{
					//alert('updating db list');
  					$('#database').append("<li>"+msg[result].name +"</li>")	
  				}
  				
			}
			$('#loader').hide();
		});
		
	socket.on('updateCount', function(count) {
		$('#numUsers').text(count).hide().fadeIn('slow');
	
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

	
	$('#addEmployee').live('submit',function(e) {
	
		e.preventDefault();
		var form = JSON.stringify($(this).serializeObject());
		socket.emit("db", form);
	
	
	});

	$('#home').live('click', function(e) {
	
		e.preventDefault();
		updatePage('main');
		var stateObj = { activePage:  'main'};
		history.pushState(stateObj, "ERNIE", '/');
		$('.active').removeClass('active');
		$(this).parent().addClass('active');
	
	});
	
	
	
	$('#onlineUsers').live('click', function(e) {
		e.preventDefault();
		//alert('clicked online');
		showOnlineUsers();
	
	});
	
	$('#loginForm').live('submit',function(e) {
	
		e.preventDefault();
		processLogin();
	
	
	});
	
	
	
	$('#loginButton').live('click', function(e) {
		e.preventDefault();
		processLogin();
	
	});
	
	$('#userLogOut').live('click', function(e) {
		e.preventDefault();
		$.cookie('loggedIn', 'false', { expires: 1, path: '/' });
		showHideMenus();
		updatePage('main');
		var stateObj = { activePage:  'main'};
		history.pushState(stateObj, "ERNIE", '/');
	
	});
	//On Click Event
	$("ul.nav li:not(.dropdown)").live('click',function(e) {
		e.preventDefault();
		var action = ($(this).find('a:first').text()).toLowerCase();
		var what = $(this).parentsUntil('ul .nav').parent().attr('class').replace('nav ', '').replace(' active', '');
		var newUrl = "/"+what +"/"+action+"/";
		
		
		var stateObj = { activePage:  what};
		history.pushState(stateObj, "ERNIE", newUrl);
		socket.emit('changePage', newUrl);
		var activeDiv = updatePage(newUrl);
		$('.active').removeClass('active');
		$(this).addClass('active');
		$(this).parentsUntil('li .dropdown').parent().addClass('active');
	
	});
	

	
	$(window).bind('popstate', function(event) {
  		var state = event.originalEvent.state;

  		if(state)
  		{	
    		updatePage(state.activePage);
    		//alert("After Scroll");
    	}
	});
	
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
	    	if(data)
	    	{
		    	$.cookie('loggedIn', 'true', { expires: 1, path: '/' });
		    	$('#body').load('/', function(response, status, xhr){
		    		var stateObj = { activePage:  'login'};
					history.pushState(stateObj, "ERNIE", path);
					updatePage(path);
					$('#loginText').Loadingdotdotdot("Stop");
					//showHideMenus();
					
				});
				var stateObj = { activePage:  'login'};
				history.pushState(stateObj, "ERNIE", path);
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

function showHideMenus()
{
	$('.forceLogIn').toggle();

}

function showOnlineUsers()
{
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
	loadingID.Loadingdotdotdot({});
	loadingID.css("top", 10);
	loadingID.css("left",($(window).width() /2) - ($('#loading').width() /2));
	loadingID.show();
}

function hideLoadingBar()
{
	$('#loading').Loadingdotdotdot("Stop");
	$('#loading').fadeOut('slow');
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

function updatePage(DivUrl)
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
	else
	{
		var splitUrl = DivUrl.split('/');
		newPage = splitUrl[1];
		action = splitUrl[2];
		activeArea = newPage +"_"+ action;
		
	}
		
	$('.content').load('/'+ newPage +'/ .content', function(response, status, xhr){
			if (status != "error") {
				socket.emit('initial');
				updateBreadCrumbs(DivUrl);
				$(window).scrollTo('.'+activeArea, 800, {offset: {top:-60, left:0}});
			}
			else {
				$('.content').load('/404/ .content');
				updateBreadCrumbs('error');
				$(window).scrollTo(0, 800);
			}
			hideLoadingBar();
			
	});
}

function capitaliseFirstLetter(string)
{
	return string.charAt(0).toUpperCase() + string.slice(1);
}