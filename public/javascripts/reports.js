var timesheetsObj  = {};
$(document).ready(function() {


	socket.emit('generateReport', 1);
	
	socket.on('generateReport', function(reportJSON){
		timesheetsObj = {};
	
		$('#activeTimesheets li').remove();
		$('#unusedTimesheets li').remove();
		var report = JSON.parse(reportJSON);
		
		$('#employeeName').text(report.timesheets[0].name+'\'s Timesheets');
		
		$.each(report.timesheets, function() {
			this.date_worked = new Date(this.date_worked).toString('ddd d MMMM yyyy');
					
			var temp = new Timesheet(this.timesheet_id, this.project_id, this.project_manager, this.task_name, this.date_worked, this.start_time, this.end_time, this.date_submitted, this.comments);
			
			if(typeof timesheetsObj[this.date_worked]  === 'undefined')
			{
				timesheetsObj[this.date_worked] = [];
			}
			
			timesheetsObj[this.date_worked].push(temp);
			

		});
		
		$.each(timesheetsObj, function(index, value) {
			$('#unusedTimesheets').append('<li><a href="#" id="timesheet-'+replaceAll(index, ' ', '-')+'">'+ index +'</a></li>');
		});
		bindClicks();
	
	});
	
	socket.on('triggerClick', function(id){
		
		$('id').trigger('click');
	
	});


});

function bindClicks()
{
		$('#unusedTimesheets').off('click')
		$('#activeTimesheets').off('click');
		
		$('#unusedTimesheets').on('click', 'li a', function(event){
			event.preventDefault();
			socket.emit('triggerClick', '#unusedTimesheets li a#'+ $(this).attr('id'));
			
			var thisDate = $(this).attr('id').replace('timesheet-', '');
			
			var objDate = replaceAll(thisDate, '-', ' ');
			
			var thisTimesheetObject = timesheetsObj[objDate];
			
			$('section #timesheets').append('<article id="timesheetDate-'+thisDate+'">'+
			'<table class="table timesheetDisplay"><tbody>'+
			'<tr><td rowspan="12"><h4>Workday: '+thisDate+'</h4></td></tr>'+
	        '<tr><td></td><td><b>Date Submitted:</b></td><td>'+this.date_submitted+'</td></tr>'+
	        '<tr><td><b>Project:</b></td><td><b>Task:</b></td><td><b>Time:</b></td></tr>'+
	        '<tr id = "startTaskList-'+thisDate+'"></tr>'+
	        '</table>'+
	         '</article>').children('article #timesheetDate-'+thisDate).hide();
	         $.each(thisTimesheetObject, function(){
	         
	         	$('#startTaskList-'+thisDate).after('<tr><td>'+this.project_id+'</td><td>'+this.task_name+'</td><td>'+this.start_time+' - '+this.end_time+'</td></tr>');
	         
	         });
	         
	         $('article #timesheetDate-'+thisDate).fadeIn();
	         
	         $(this).fadeOut('fast', function(){
	         
	         	$('#activeTimesheets').append('<li><span id = "removeTimesheet-'+thisDate+'" class="pull-right linked-icon"><i class="icon-remove"></i></span>'+$(this).text()+'</li>').hide().fadeIn()
	         });
		
	
	});
	
	$('#activeTimesheets').on('click', 'li span', function(event){
			event.preventDefault();
			socket.emit('triggerClick', '#activeTimesheets li span#'+$(this).attr('id'));
			
			var divDate = $(this).attr('id').replace('removeTimesheet-', '');
			var thisDate = replaceAll(divDate, '-', ' ');
			
			$('article #timesheetDate-'+divDate).fadeOut('fast', function(){$(this).remove()})
	         
	         $(this).parent('li').fadeOut('fast', function(){
	         	$(this).remove();
	         
	         	$('#unusedTimesheets').append('<li><a href="#" id="timesheet-'+divDate+'">'+ thisDate +'</a></li>').hide().fadeIn()
	         });
		
	
	});

}


function Timesheet(id, project_id, project_manager_id, task_name, date_worked, start_time, end_time, date_submitted, comments)
{
	this.id = id;
	this.project_id = project_id;
	this.task_name = task_name;
	this.date_worked = date_worked;
	this.start_time = start_time;
	this.end_time = end_time;
	this.date_submitted = date_submitted;
	this.comments = comments;
}

/*

						<!-- article#timesheet-1
							table.table.timesheetDisplay
								tbody
									tr
										td(rowspan = "12")
											h4 Workday: 21st Feb. 2012
									tr
										td
										td 
											b Date Submitted:
										td 24th Feb. 2012
									tr
										td 
											b Project:
										td 
											b Task:
										td
											b Time:
									tr
										td 2011114 - Thirdforce
										td Software QA
										td 09:00 - 11:30
									tr
										td 2011114 - Thirdforce
										td Code Review
										td 11:30 - 13:00
									tr
										td 2010149 - BOE
										td Software QA
										td 14:00 - 15:30
									tr
										td 2010149 - BOE
										td Script Generation
										td 15:30 - 17:00
									tr
										td 2011114 - Thirdforce
										td Software QA
										td 17:00 - 18:30 -->
										
*/