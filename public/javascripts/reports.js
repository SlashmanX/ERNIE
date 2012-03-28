var timesheetsObj  = {};
var startSort;
var stopSort;
$(document).ready(function() {

	reportsBind();


});
socket.on('sortItem', function(sort){
	console.log('in here');
	sort = JSON.parse(sort);
	console.log(sort);
	var el = $('section#timesheets article:eq(' + sort.from +')');
	$('section#timesheets article:eq(' + sort.from +')').fadeOut(1000, function()
	{
		if(sort.from > sort.to)
		{
			$('section#timesheets article:eq(' + sort.from +')').insertBefore($('section#timesheets article:eq(' + sort.to +')'));
		}
		else
		{
			$('section#timesheets article:eq(' + sort.from +')').insertAfter($('section#timesheets article:eq(' + sort.to +')'));
		}
		$('section#timesheets article:eq(' + sort.to +')').fadeIn(1000);
	});
});
function reportsBind()
{
	socket.emit('generateReport', 1, function(reportJSON){
		console.log('got report')
		timesheetsObj = {};
		startSort = -1;
		stopSort = -1;
	
		$('#activeTimesheets li').remove();
		$('#unusedTimesheets li').remove();
		var report = JSON.parse(reportJSON);
		
		$('#employeeName').text(report.timesheets[0].name+'\'s Timesheets');
		
		$.each(report.timesheets, function() {
			this.date_worked = new Date(this.date_worked).toString('ddd d MMMM yyyy');
			this.date_submitted = new Date(this.date_submitted).toString('ddd d MMMM yyyy');
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

	
	/*socket.on('changePos', function(pos){
		console.log('in here');
		pos = JSON.parse(pos);
		console.log(pos);
		$('section#timesheets article:eq(' + pos.index +')').offset({ top : pos.pos.top, left : pos.pos.left});
	});*/
	/*socket.on('triggerClick', function(trigger){
		trigger = JSON.parse(trigger);
		$(trigger.object).trigger('click');
	
	});*/
}
function bindClicks()
{
		$('#unusedTimesheets').off('click')
		$('#activeTimesheets').off('click');
		
		$('#unusedTimesheets').on('click', 'li a', function(event, from){
			event.preventDefault();
			if(from != 'server')
			{	
				socket.emit('triggerClick', {object : '#unusedTimesheets li a#'+ $(this).attr('id'), newPage : "/reports/"});
			}
			
			var thisDate = $(this).attr('id').replace('timesheet-', '');
			
			var objDate = replaceAll(thisDate, '-', ' ');
			
			var thisTimesheetObject = timesheetsObj[objDate];
			console.log(thisTimesheetObject.date_submitted);
			$('section #timesheets').append('<article id="timesheetDate-'+thisDate+'" class = "reportDrag">'+
			'<table class="table timesheetDisplay"><tbody>'+
			'<tr><td rowspan="12"><h4>Workday: '+objDate+'</h4></td></tr>'+
	        '<tr><td></td><td><b>Date Submitted:</b></td><td>' + thisTimesheetObject.date_submitted + '</td></tr>'+
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
	
	$('#activeTimesheets').on('click', 'li span', function(event, from){
			event.preventDefault();
			if(from != 'server')
			{
				socket.emit('triggerClick', {object : '#activeTimesheets li span#'+$(this).attr('id'), newPage : "/reports/"});
			}
			var divDate = $(this).attr('id').replace('removeTimesheet-', '');
			var thisDate = replaceAll(divDate, '-', ' ');
			$('article #timesheetDate-'+divDate).fadeOut('fast', function(){$(this).remove()})
	         $(this).parent('li').fadeOut('fast', function(){
	         	$(this).remove();
	         	$('#unusedTimesheets').append('<li><a href="#" id="timesheet-'+divDate+'">'+ thisDate +'</a></li>').hide().fadeIn()
	         });
	});
	
	//DRAG N' DROP
	$('section#timesheets').sortable({
	    handle: 'table',  
	    cursor: 'move',  
	    placeholder: 'placeholder',  
	    forcePlaceholderSize: true,  
	    opacity: 0.4,  
	}).disableSelection();
	
	$( "section#timesheets" ).on( "sortstart", function(event, ui) {
		console.log($(ui.item).index());
		startSort = $(ui.item).index();
	});
	
	$( "section#timesheets" ).on( "sortupdate", function(event, ui) {
		console.log($(ui.item).index());
		stopSort = $(ui.item).index();
		console.log('emitting');
		socket.emit('sortItem', {from : startSort, to : stopSort});
	});
	
	/*$( "section#timesheets" ).on( "sort", function(event, ui) {
		socket.emit('changePos', {index: startSort, pos : ui.position});
	});*/
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