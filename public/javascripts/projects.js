var projects;
$(document).ready(function() {

	projectsBind();
	

});
function projectsBind()
{
	var path = location.pathname;
	projects = [];
	var path = path.split('/');
	var projectID = -1;
	if(path.length == 4 && path[2] != 'all')
	{
		projectID = path[2];
	}
	
	var stateObj = { projectID:  projectID};
	history.replaceState(stateObj, "ERNIE");

	socket.emit('getProject', projectID, onGetProject);
}
function clickRow(id, from)
{
	console.log(from);
	if(from != 'server')
	{
		socket.emit('triggerClick', {object: '.projectsTable tr#p_'+id, newPage : '/projects/'+ id +'/'});
	}
	showLoadingBar();
	
	$('.content').load('/projects/'+id+'/ .content > *', function(response, status, xhr){
			if (status != "error") {
				socket.emit('getProject', id, onGetProject);
				stateObj = { projectID:  id};
				history.pushState(stateObj, "ERNIE", '/projects/'+id+'/');
				hideLoadingBar();
			}
	});
}

function onGetProject(projectJSON){

	$('.projectsTable tbody tr').remove();
	$('.projectsTable tbody').hide();
	projects = JSON.parse(projectJSON);
	if(projects.project.length > 1)
	{
		$.each(projects.project, function() {
    		// Use the values this.Name and this.Location
    		$('.projectsTable tbody').append('<tr id = "p_'+ this.project_id +'"><td>'+this.project_id+'</td><td>'+this.project_name+'</td><td>'+this.name+'</td></tr>');
		});
		$('.projectsTable tbody').fadeIn('slow');
	}
	else
	{
		//apend details such as current tasks, people working on project etc.
		$.each(projects.project, function() {
    		// Use the values this.Name and this.Location
    		$('.projectsTable tbody').append('<tr id = "p_'+ this.project_id +'"><td>'+this.project_id+'</td><td>'+this.project_name+'</td><td>'+this.name+'</td></tr>').hide();
		});
		$('.projectsTable tbody').fadeIn('slow');
		$('#showAllProjects').slideDown('fast');
	}
	
	bindHandlers();

}

function bindHandlers()
{
	$('tbody').on('click', 'tr', function(event, from){
		clickRow($(this).attr('id').replace('p_', ''), from)
	}); // passing 'data' to the event seems to use 'body' for $(this) rather than the tr
	
	$('#showAllProjects').on('click', 'a', function(event, from){
		event.preventDefault();
		if(from != 'server')
		{
    		socket.emit('triggerClick', {object : '#showAllProjects a', newPage : '/projects/all/'});

		}
		showLoadingBar();
		$('.content').load('/projects/all/ .content > *', function(response, status, xhr){
			if (status != "error") {
				socket.emit('getProject', -1, onGetProject);
				stateObj = { projectID:  -1};
				history.pushState(stateObj, "ERNIE", '/projects/all/');
				hideLoadingBar();
			}
		});
	
	});
}

$(window).bind('popstate', function(event) {
	var state = event.originalEvent.state;

		if(state)
		{	
			socket.emit('getProject', state.projectID, onGetProject);
			bindHandlers();
		}
		
});