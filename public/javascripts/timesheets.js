
$(document).ready(function() {
	$("#date_worked").dateinput({format: 'dd/mm/yyyy'});
	//$('#tab a:first').tab('show');
	var projects = [];
	var tasks = [];
	var temp;
	var mainOptions = $('#taskMain');
	var subOptions = $('#taskSub');
	socket.emit('getProject', -1);
	
	socket.emit('getTasks');
	
	socket.on('getTasks', function(tasksJSON){
		tasks = JSON.parse(tasksJSON);
	
		$.each(tasks.task, function() {
	    	if(this.parent == 0)
	    	{
				mainOptions.append('<option value="'+ this.id +'">'+ this.name +'</option>');

			}

		});
		
		mainOptions.trigger('change');
	
	});
	
	$('#taskMain').on('change', function(event){
		subOptions.html('');
		var selectedID = $(this).val();
		
		$.each(tasks.task, function() {
	    
	    	if(this.parent == selectedID)
	    	{
				subOptions.append('<option value="'+ this.id +'">'+ this.name +'</option>');
			}

		});
	
	});
	
	socket.on('getProject', function(projectsJSON){
		temp = JSON.parse(projectsJSON);
		$.each(temp.project, function() {
	    		// Use the values this.Name and this.Location
	    		projects.push(this.project_id +' - '+ this.project_name);
			});
		$('#projectInput').typeahead({source: projects});
	});
	
	$('.reset-project').on('click', function(event){
		$('#projectInput').attr('disabled', false).val('').focus();
	
	});
	
	$('#projectInput').on('blur', function(event){
		if(!($(this).is(':disabled')))
		{
			$(this).parentsUntil('.control-group').parent('div').addClass('warning').children('p.help-block').text('Please make sure you have selected a valid project.');
		}
	
	});
	
	/*$('a[data-toggle="tab"]').on('shown', function (e) {
  		e.target // activated tab
  		e.relatedTarget // previous tab
	});*/

});