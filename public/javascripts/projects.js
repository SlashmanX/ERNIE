$(document).ready(function() {

	var path = location.pathname;
	var projects;
	var path = path.split('/');
	var projectID = -1;
	if(path.length == 4)
	{
		projectID = path[2];
	}
	
	var stateObj = { projectID:  projectID};
	history.replaceState(stateObj, "ERNIE");

	socket.emit('getProject', projectID);
	
	socket.on('getProject', function(projectJSON){
	
		$('.projectsTable tbody tr').remove();
			
		projects = JSON.parse(projectJSON);
		
		if(projects.project.length > 1)
		{
	
			$.each(projects.project, function() {
	    		// Use the values this.Name and this.Location
	    		$('.projectsTable tbody').append('<tr id = "p_'+ this.project_id +'"><td>'+this.project_id+'</td><td>'+this.project_name+'</td><td>'+this.name+'</td></tr>');
			});
		}
		else
		{
			//apend details such as current tasks, people working on project etc.
			$.each(projects.project, function() {
	    		// Use the values this.Name and this.Location
	    		$('.projectsTable tbody').append('<tr id = "p_'+ this.project_id +'"><td>'+this.project_id+' Lonely</td><td>'+this.project_name+'</td><td>'+this.name+'</td></tr>');
			});
		}
	
	});
	
	bindHandlers();
	

});

function clickRow(id)
{
	showLoadingBar();
	
	$('.content').load('/projects/'+id+'/ .content > *', function(response, status, xhr){
			if (status != "error") {
				socket.emit('getProject', id);
				stateObj = { projectID:  id};
				history.pushState(stateObj, "ERNIE", '/projects/'+id+'/');
				bindHandlers();
				hideLoadingBar();
			}
			
	});
}

function bindHandlers()
{
	$('tbody').on('click', 'tr', function(event){clickRow($(this).attr('id').replace('p_', ''))}); // passing 'data' to the event seems to use 'body' for $(this) rather than the tr
}
$(window).bind('popstate', function(event) {
	var state = event.originalEvent.state;

		if(state)
		{	
			socket.emit('getProject', state.projectID);
			bindHanlders();
		}
		
});