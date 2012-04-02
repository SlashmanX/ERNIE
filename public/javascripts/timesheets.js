var mainOptions;
var subOptions;
var projects;
$(document).ready(function () {

	timesheetsBind();
});

function timesheetsBind()
{
	projects = [];
	var tasks = [];
	mainOptions = $('#taskMain');
	subOptions = $('#taskSub');
	var path = location.pathname;
	var path = path.split('/');
	var activeTab = 'add';
	
	if(path.length == 4 && path[2] != 'add')
	{
		activeTab = path[2];
	}
	
	switch(activeTab)
	{
		case 'add':
			addTimesheetsJS();
		break;
		case 'review':
			$('.nav-tabs a:last').tab('show');
		break;
	}
	
	bindItems();
	
	$('a[href = "#review"]').on('show', function (e) {
		showLoadingBar();
	});
	
	$('a[href = "#add"]').on('show', function (e) {
		showLoadingBar();
	});
	
	$('a[href = "#review"]').on('shown', function (e) {
		hideLoadingBar();
		var stateObj = { activeTab:  'review'};
		history.pushState(stateObj, "ERNIE", '/timesheets/review/');
		reviewTimesheetsJS();
	});
	
	$('a[href = "#add"]').on('shown', function (e) {
		hideLoadingBar();
		var stateObj = { activeTab:  'add'};
		history.pushState(stateObj, "ERNIE", '/timesheets/add/');
		addTimesheetsJS();
	});
}

function bindItems()
{
	
	$('#date_worked').dateinput({format: 'dd/mm/yyyy', max: 1});
	$('body').on('focus', 'input, select', function(e) {
		socket.emit('textboxFocus', {id: $(this).attr('id'), initValue: $(this).val()});
	
	});
	
	$('input, select').on('keyup change', function(e, from) {
		if(from != 'server')
		{
			socket.emit('textboxTyped', {id: $(this).attr('id'), value: $(this).val()});
		}
	});
	
	$('body').on('blur', 'input, select', function(e, from) {
		if(from != 'server')
		{
			socket.emit('textboxBlur', {id: $(this).attr('id'), value: $(this).val()});
		}
	
	})
    $('#taskMain').on('change', function(event){
		subOptions.html('');
		var selectedID = $(this).val();
		$.each(tasks.task, function() {
	    	if(this.parent == selectedID)
	    	{
				subOptions.append('<option value="'+ this.id +'">'+ this.task_name +'</option>');
			}

		});
	
	});
	
	$('.reset-project').on('click', function(event){
		$('#projectInput').removeAttr('readonly').val('').focus();
	
	});
	
	$('#projectInput').on('blur', function(event){
		if((jQuery.inArray($(this).val(), projects)) == -1)
		{
			$(this).parentsUntil('.control-group').parent('div').addClass('warning').children('p.help-block').text('Please make sure you have selected a valid project.');
		}
		else
		{
			$(this).parentsUntil('.control-group').parent('div').removeClass('warning error').children('p.help-block').text('');
		}
	
	});
	
	$('button[type=reset]').on('click', function(event){ 
	
		$('#projectInput').removeAttr('readonly');
		//notifications.show('Error submitting timesheet!');
	
	})
	
	$('form#timesheetForm').on('submit', function(event){
	
		var timesheetData = {};
		event.preventDefault();
		$('#submitTimesheet').button('loading');
		if((jQuery.inArray($(this).val(), projects)) == -1)
		{
			$('#projectInput').parentsUntil('.control-group').parent('div').addClass('error').children('p.help-block').text('Please select a valid project.');
			return false;
		}
		timesheetData['project_id'] = $('#projectInput').val().replace(/[^\d\.]+/g, "");
		timesheetData['task_id'] = subOptions.val();
		timesheetData['date_worked'] = $('#date_worked').val();
		timesheetData['start_time'] = $('#startTime').val();
		timesheetData['end_time'] = $('#endTime').val();
		timesheetData['comment'] = $('#comments').val();
		var formData = decodeURIComponent($.param(timesheetData));
		$.ajax({
  		type: "POST",
    	url: "/submitTimesheet",
	    data: formData,
	    success: function(data) {
	    	if(data != '-1')
	    	{
	    		$('#submitTimesheet').button('reset');
	    		notifications.show('Timesheet submitted successfully!');
	    		$('button[type=reset]').trigger('click');
			}
			else
			{
				notifications.show('Error submitting timesheet!');
				$('#submitTimesheet').button('reset');
			}
      	}
	  });
	
	});
}

function reviewTimesheetsJS()
{
	socket.emit('getTimesheets', -1, function(timesheetsJSON){
		$('.timesheetsTable tbody tr').remove();
		myTimesheets = JSON.parse(timesheetsJSON);
	
		$.each(myTimesheets.timesheet, function() {
			var approved = 'ok';
			if(this.approved == 0)
			{
				approved = 'remove'
			}
		
			$('.timesheetsTable tbody').append('<tr id = "p_'+ this.timesheet_id +'"><td>'+ new Date(this.date_submitted).toString("dd/MM/yyyy")+'</td><td>'+this.project_name+ this.timesheet_id+'</td><td>'+this.name+'</td><td>'+this.task_name+'</td><td>'+new Date(this.date_worked).toString("dd/MM/yyyy")+'</td><td>'+this.start_time+' - '+this.end_time+'</td><td class = "linked-icon"><i class="icon-pencil"></i> <i class="icon-trash"></i></td><td class="center-icon"><i class = "icon-'+approved+'"></i></td></tr>');

		});
	});
}

function addTimesheetsJS()
{	
	var temp;
	socket.emit('getProject', -1, function(projectsJSON){
		projects = [];
		temp = JSON.parse(projectsJSON);
		$.each(temp.project, function() {
	    		// Use the values this.Name and this.Location
	    		projects.push(this.project_id +' - '+ this.project_name);
			});
		$('#projectInput').typeahead({source: projects});
	});
	
	
	socket.emit('getTasks',function(tasksJSON){
		mainOptions.html('');
		tasks = JSON.parse(tasksJSON);
	
		$.each(tasks.task, function() {
	    	if(this.parent == 0)
	    	{
				mainOptions.append('<option value="'+ this.id +'">'+ this.task_name +'</option>');

			}

		});
		mainOptions.trigger('change');
	
	});
	

}