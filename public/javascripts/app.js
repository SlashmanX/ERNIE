var url = [location.protocol, '//', location.host].join('');
var socket = io.connect(url);

var scripts = [];

var notifications;

var chatScrollAPI;

var sessionsScrollAPI;

var chatBox;

var stateObj;

var loadedScripts = [];

var tempChat = {};

var chatLog = [];

var currentSession = "";

jQuery(document).ready(function($) {

	var url = [location.protocol, '//', location.host].join('');
	var path = location.pathname;
	var chatLog = [];
	var currentSession = "";
	var tempLog = [];
	if(path.substr(-1) !== '/') {
        path+= '/';
        stateObj = { activePage:  path};
		history.replaceState(stateObj, "ERNIE", url + path);

    }
	if(path === '/' || path === '/index.html')
	{
		stateObj = { activePage:  'main'};
		history.pushState(stateObj, "ERNIE", '/');
		path = 'main';
	}
	if (!$('body').hasClass('login')) {
       updatePage(path);
    }

	$.ajaxSetup({
	  cache: true
	});
	
	//$.inlog(true);
	if($.cookie('loggedin') == 'true')
	{
		initSocketFunctions();
		bindMenus();
	}
	
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
				$('.outer').load('/ .outer', function(){
					stateObj = { activePage:  'login'};
					history.pushState(stateObj, "ERNIE", path);

					updatePage(path, function(){
						$('#loginText').Loadingdotdotdot("Stop");
						bindMenus();
						initSocketFunctions();
						socket.emit('setUserID', data);
						socket.emit('updateCount');
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
	notifications = $('body').ttwSimpleNotifications();
	
	$('.scrollBar').jScrollPane({
		horizontalGutter:5,
		verticalGutter:5,
		animateScroll: true,
		autoReinitialise: true,
		'showArrows': false
	});
	chatBox = $('ul.chatMessages');
	
	
	$(window).on('resize', function() {
		chatHeight = $(this).height() - 320;
		chatBox.css("height", chatHeight);
	});
	
	var chatHeight = $(window).height() - 320;
	chatBox.css("height", chatHeight);

	
	chatScrollAPI = $('ul.chatMessages').data('jsp');
	
	sessionsScrollAPI = $('ul.activeSessions').data('jsp');
	
	$('.jspDrag').hide();
	$('.jspScrollable').mouseenter(function(){
	    $(this).find('.jspDrag').stop(true, true).fadeIn('slow');
	});
	$('.jspScrollable').mouseleave(function(){
	    $(this).find('.jspDrag').stop(true, true).fadeOut('slow');
	});
	
	
	//DONE!(?): Tweak so chat notifications disappear as you scroll. Try: http://stackoverflow.com/questions/487073/jquery-check-if-element-is-visible-after-scrolling with li:last?
	
	$('ul.chatMessages').on('scroll', function() {
		if (chatScrollAPI.getContentHeight() - chatScrollAPI.getContentPositionY() == $(this).outerHeight())
		{
			$('span#chatNotificationCount').text('0');
		}
    });
	$('#sessionsSideNav').collapse({toggle: false});
	
	$('#chat').on('shown', function () {
		if ((chatScrollAPI.getContentHeight() - chatScrollAPI.getContentPositionY() == $(this).outerHeight()) || !chatScrollAPI.getIsScrollableV())
		{
			$('span#chatNotificationCount').text('0');
		}
		$('.chatInput').focus();
	});
	//webkitTransitionEnd oTransitionEnd transitionend
	$('nav.sessions').on('nresize', function(event){
	
		if($(this).width() < 240)
		{
			$('div.accordion-body.in').collapse('hide');
			$('#sessionsSideNav').collapse({toggle: false});
		}
	});
	
	
	$('a[rel=tooltip]').tooltip({});
	
	$('form#startingSession').on('submit', function(e){
		e.preventDefault();
		console.log('clicked')
		var sessionName = $('#newSessionName').val();
		var isPublic = $('#publicSession').is(':checked');
		var isBi = $('#bidirectionalSession').is(':checked');
		var isChat = $('#chatOnly').is(':checked');
		var data = {name: sessionName, public: isPublic, bidirectional: isBi, currentPage: location.pathname, chatOnly : isChat};
		$(this).button('loading');

		socket.emit('createSession', data, function(newSession) {
			/*$('#sessionIDModal').modal('show');
			$('#newSessionName').val('');
			$('#sessionURL').val(url + '/s/'+newSession.name+'/').focus().select();
			$('#startNewSession').button('reset');*/
			joinNewSession(newSession, 'true');
		});
	
	});
	
	$('.checkboxOn').on('click', function(e) {
		e.preventDefault();
		var parent = $(this).parent('div');
		parent.children('.checkboxOff').removeClass('btn-primary');
		$(this).addClass('btn-primary');
		var checkboxID = parent.attr('id').replace('toggle', '');
		$('input#'+checkboxID).attr('checked', true);
	});
	
	$('.checkboxOff').on('click', function(e) {
		e.preventDefault();
		var parent = $(this).parent('div');
		parent.children('.checkboxOn').removeClass('btn-primary');
		$(this).addClass('btn-primary');
		var checkboxID = parent.attr('id').replace('toggle', '');
		$('input#'+checkboxID).removeAttr('checked');
	});
	
	$('.chatInput').on('keypress', function(e){
	
		var code = (e.keyCode ? e.keyCode : e.which);
		if(code == 13) 
		{ //Enter keycode
			socket.emit('sendChat', $(this).val());
			$(this).val('');
		}

	
	});
	
	$('.chatInput').on('keyup', function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if($(this).val().length > 0 && code != 8)
		{
			socket.emit('isTyping');
		}
	});
	
	$('.chatInput').onTypeFinished(function(){
		socket.emit('stopTyping');
	});
	
	$('ul.nav:not(#user) a').on('click', function(e, from) {
	
		e.preventDefault();
		var newUrl = $(this).attr('href');
		if(from != 'server')
		{
			var thisTrigger = '#'+$(this).parent('li').attr('id') + ' a';
			socket.emit('triggerClick', {object: thisTrigger, newPage: newUrl});
		}
		document.title = $(this).text() +" | ERNIE";
		updatePage(newUrl);
		$('.active').removeClass('active');
		$(this).parent('li').addClass('active');
	
	});
	$("ul.nav#user li:not(.dropdown):not(#userLogOut):not(#sessionStart) a").on('click',function(e, from) {
		e.preventDefault();
		var newUrl = $(this).attr('href');
		if(from != 'server')
		{
			var thisTrigger = '#'+$(this).parent('li').attr('id') + ' a';
			socket.emit('triggerClick', {object: thisTrigger, newPage:  newUrl});
		}
		updatePage(newUrl);
		$('.active').removeClass('active');
		$(this).parent('li').addClass('active');
		$(this).parentsUntil('li .dropdown').parent('li').addClass('active');
	
	});
	
	$('#userCount').on('click', function(e) {
		e.preventDefault();
		showOnlineUsers();
	
	});
	
	$('ul.activeSessions').on('click', 'a', function(e){
		e.preventDefault();
		if($(this).parent('li').hasClass('availableSession'))
		{
			joinNewSession($(this).text());
		}
		else
		{
			alert('private session');
		}
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
	    socket.emit('getActiveSessions', {}, function(sessionsJSON){
			var sessions = JSON.parse(sessionsJSON);
			var sessionList = $('ul.activeSessions li:last');
			var status = 'unavailable';
			var count = 0;
			$.each(sessions.session, function() {
				++count;
				if(this.public)
				{
					status = 'available';
				}
				else
				{
					status = 'unavailable';
				}
				sessionsScrollAPI.getContentPane().append('<li class="'+status+'Session"><a href = "/s/'+this.name+'/">'+this.name+'</a></li>').hide().fadeIn();
			});
			$('span#activeSessionsNotificationCount').text(count);
			//sessionsScrollAPI.reinitialise();
	    });
	});
	
	socket.on('newSessionActive', function(session){
		session = JSON.parse(session);
		var status = 'unavailable';
		if(session.isPublic)
	    {
			status = 'available';
	    }
	
		//$('ul.activeSessions li:last').after('<li class="'+status+'Session"><a href = "/s/'+session.name+'/">'+session.name+'</a></li>').hide().fadeIn();
		sessionsScrollAPI.getContentPane().append('<li class="'+status+'Session"><a href = "/s/'+session.name+'/">'+session.name+'</a></li>').hide().fadeIn();

		//sessionsScrollAPI.reinitialise();
		var notiCount = $('span#activeSessionsNotificationCount');
		var prevCount = (parseInt(notiCount.text(), 10));
		var newCount = ++prevCount;
		notiCount.text(newCount).hide().fadeIn('slow');
	
	});
	
	socket.on('isTyping', function(user){
		user = JSON.parse(user);
		$('#typingArea').text(user.name + ' is typing...');
	});
	socket.on('stopTyping', function(user){
		user = JSON.parse(user);
		$('#typingArea').html('&nbsp;');
	});
	socket.on('updateCount', function(count) {
		$('#onlineUsers').text(count).hide().fadeIn('slow');
	
	});
	
	socket.on('textboxLostFocus', function(textbox) {
		textbox = JSON.parse(textbox);
		$('input#'+textbox.id).val(textbox.value);
		if($('input#'+textbox.id).attr('data-selected') != 'yes')
		{	
			$('input#'+textbox.id).removeAttr('readonly');
		}
		$('input#'+textbox.id+', select#'+textbox.id).trigger('blur', ['server']);
	
	});
	
	// DONE: If user at bottom, add + scroll else just add.
	
	socket.on('receiveChat', function(msg){
	
		msg = JSON.parse(msg);
		var atBottom = false;
		chat = {};
		chat.from = msg.user;
		chat.text = msg.text;
		chatLog.push(chat);

		if(!chatScrollAPI.getIsScrollableV())
		{
			atBottom = true;
		}
		else if (chatScrollAPI.getContentHeight() - chatScrollAPI.getContentPositionY() == $('ul.chatMessages').outerHeight())
		{
			atBottom = true; // Need to check this before re-init as the new element will be at the bottom
		}
		chatScrollAPI.getContentPane().append('<li class="chat"><b>'+msg.user+':</b> '+msg.text+'</li>').children(':last').hide().fadeIn('fast');

		chatScrollAPI.reinitialise();
		if (atBottom)
		{
			chatScrollAPI.scrollToY(chatScrollAPI.getContentPane()[0].scrollHeight);
		}
		//TODO: If chat msg is not from myself, update notifications
		if( !msg.fromMe && (chatScrollAPI.getIsScrollableV() || $('div#chat').hasClass('collapse')) )
		{
			var notiCount = $('span#chatNotificationCount');
			var prevCount = (parseInt(notiCount.text(), 10));
			var newCount = ++prevCount;
			notiCount.text(newCount).hide().fadeIn('slow');
		}
	
	});
	
	socket.on('textboxTyped', function(textbox) {
		textbox = JSON.parse(textbox);
		$('input#'+textbox.id+', select#'+textbox.id).val(textbox.value);
		$('input#'+textbox.id+', select#'+textbox.id).trigger('change', ['server']);
		$('input#'+textbox.id+', select#'+textbox.id).trigger('keyup', ['server']);

	});
	
	socket.on('textboxHasFocus', function(textbox) {
		textbox = JSON.parse(textbox);
		$('input#'+textbox.id).attr('readonly', 'readonly');
	
	});

	
	socket.on('disconnect', function() {
	    console.log('Disconnected!');
	});
	
	socket.on('notification', function(msg) {
	    notifications.show(msg);
	});
	
	socket.on('triggerClick', function(tObject) {
		$(tObject).trigger('click', ['server']);	
	
	});
}

function showHideMenus()
{
	$('.forceLogIn').toggle();

}

function showOnlineUsers()
{
	$('#onlineUsersModal').modal('show');
	socket.emit('getUsers', function(UserArray){
	
		var usersOnline = '';
		UserArray.replace(/[^a-zA-Z 0-9]+/g,'');
		var UsersArray = UserArray.split(',');
		var i = 0;
		for(i; i < UsersArray.length; i++)
		{
			var username = UsersArray[i].replace(/[^a-zA-Z 0-9]+/g,'');
			if(username != '')
			{	
				usersOnline = usersOnline  + username + '<hr/>';
			}
		}
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
				//updated += '<a href="/'+ newURL[i] +'/">'+capitaliseFirstLetter(newURL[i])+'</a><div class="breadcrumb_divider"></div>';
			}
			//alert('i after '+ i )
			//updated += '<a class="current">'+capitaliseFirstLetter(newURL[i])+'</a>';
		
			
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
	$('.content').load('/'+ newPage +'/ .content > *', function(response, status){
			if (status != "error") {
				updateBreadCrumbs(DivUrl);
				var stateObj = { activePage:  DivUrl};
				history.pushState(stateObj, "ERNIE", DivUrl);
				loadScriptFiles(newPage);
			}
			else {
				$('.content').load('/404/ .content');
				updateBreadCrumbs('error');
			}
			hideLoadingBar();
			if(typeof callback != 'undefined')
			{
				callback(status);
			}
			
	});
}

function joinNewSession(sessionID, me) {
	if(me != 'true')
	{
		socket.emit('joinSession', sessionID, joinedSession);
	}
	else
	{
		joinedSession(sessionID)
	}
}

function joinedSession(theNewSession){
	if(typeof theNewSession != "Object")
	{
		theNewSession = JSON.parse(theNewSession);
	}
	console.log(theNewSession);
	//TODO: Check if current joined session exists in the chatLog, if it does, add the chats
	if(localStorage.getItem('ChatLog'))
	{
		tempLog = JSON.parse(localStorage.getItem('ChatLog'));
	}
	else
	{
		tempLog = [];
	}
	if(chatLog.length > 0)
	{
		tempLog.push({session: currentSession, chat: chatLog});
		localStorage.setItem('ChatLog', JSON.stringify(tempLog));
	}
	$('ul.chatMessages li.chat').remove();
	$('#chatParticipants').text('Currently chatting in session: '+ theNewSession.name);
	$('.chatInput').removeAttr('readonly').removeAttr('title');
	$('#sessionBoxName').text(theNewSession.name);
	$('.sessionBox').fadeIn();

	if(!(theNewSession.isChatOnly))
	{
		updatePage(theNewSession.currentPage);
	}
	currentSession = theNewSession.name;
	chatLog = [];
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

function loadScriptFiles(script){

    if($.isArray(script)){
        $.each(script, function(intIndex, objValue){
            if($.inArray(objValue, loadedScripts) < 0){
                $.getScript(objValue, function(){
                    loadedScripts.push(objValue);
                });
            }
        });
    }
    else{
		if($.inArray(script, loadedScripts) < 0){
       	 $.getScript("/javascripts/"+script+".js", function(){
	            		loadedScripts.push(script);
	               });
        }
		else
		{
			// Variable function name
			window[script+"Bind"]();
		}
    }
}
