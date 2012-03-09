var chart;
var tasks;
var colors = Highcharts.getOptions().colors;
var categories = [];
var totalTask= 0;
var data = [];
var drilldown = [];
var chartType = 'pie';
var gotProjects = false;
$(document).ready(function() {

	showLoadingBar();
	//chart = new Highcharts.Chart({});
	//chart.showLoading();
	
	socket.emit('getGraph', 1);
	categories = [];
	totalTask= 0;
	data = [];
	drilldown = [];
	gotProjects = false;
	$('#changeChart').on('click', function(event){
		
		event.preventDefault();
		chartType = $('select#newType option:selected').val();
		//alert(chartType);
		changeType(chart, chartType);
	
	});
	
	$('#addToChart').on('click', function(event){
		
		event.preventDefault();
		var series = chart.series[0];
		
	
		series.addPoint({name: 'New Point', color: colors[Math.round(Math.random() * 10)], y: (Math.random() * 100)}, true);
	
	});
      
});

function changeType(chart, newType)
{
	var serie;
       
   for(var i = 0; i < chart.series.length; i++)
   {
       serie = chart.series[i];
       
       //alert('adding series of type: '+ newType);

       chart.addSeries({
          type: newType,
          name: serie.name,
          color: serie.color,
          data: serie.options.data
       }, false);
       
       serie.remove(false);   
   }
       
   chart.redraw();
}

socket.on('getGraph', function(graphJSON){
	totalTask = 0
	categories = [];

	tasks = JSON.parse(graphJSON);
	//alert(Object.keys(tasks.task[0]));
	$.each(tasks.task, function(index, value){
	
		totalTask += this['COUNT(tasks.id)'];
		this.projects = [];
		
		
		socket.emit('getTasksProjectBreakdown', {task: this.task_id, employee: this.employee_id}, function(projectJSON){
			tasks['task'][index]['totalProject'] = 0;
		
			var projectsS = JSON.parse(projectJSON);
			$.each(projectsS.project, function(){
			
				tasks['task'][index]['projects'].push({name: this.project_name, count: this['COUNT(projects.project_id)']});
				tasks['task'][index]['totalProject'] += this['COUNT(projects.project_id)'];
				
			
			});
			
			var tempCategories = [];
			var tempData = [];
			var thisProjectTotal = tasks['task'][index]['totalProject'];
			$.each(tasks['task'][index].projects, function() {
				tempCategories.push(this.name);
				tempData.push({name : this.name, y: Math.round((this.count/thisProjectTotal) * 100)});
				tasks['task'][index].drilldown = {name: 'Project Breakdown for '+ tasks.task[index].task_name, categories: tempCategories, data: tempData, color: colors[1]};
			});
			
			gotProjects = true;
		
		});
		
		categories.push(this.task_name);

	});


});
	
socket.on('graphReady', function(){
	data = [];
	drilldown = [];
	$.each(tasks.task, function(index, value) {
		this['y'] = Math.round((this['COUNT(tasks.id)'] / totalTask) * 100);
		data.push({name: this['task_name'], y: this['y'], color: colors[index], drilldown: this.drilldown});
		
	});
    var name = 'User Workload by Task and Project';
   
   function setChart(type, name, categories, data, color) {
      chart.xAxis[0].setCategories(categories);
      chart.series[0].remove();
      chart.addSeries({
      	 type: type,
         name: name,
         data: data,
         color: color || 'white'
      });
   }
   
   chart = new Highcharts.Chart({
      chart: {
         renderTo: 'graphContainer',
         type: 'pie',
      },
      title: {
         text: 'User Workload by Task, E&oacute;in Martin'
      },
      subtitle: {
         text: 'Click the columns to view projects. Click again to view tasks.'
      },
      xAxis: {
         categories: categories                     
      },
      yAxis: {
         title: {
            text: '% Time spent on task'
         }
      },
      plotOptions: {
         pie: {
         	showInLegend: true,
         	allowPointSelect: true,
            cursor: 'pointer',
            point: {
               events: {
                  click: function() {
                     var drilldown = this.drilldown;
                     if (drilldown) { // drill down
                        setChart(chartType, drilldown.name, drilldown.categories, drilldown.data, drilldown.color);
                     } else { // restore
                        setChart(chartType, name, categories, data);
                     }
                  }
               }
            },
            dataLabels: {
               enabled: true,
               color: colors[0],
               style: {
                  fontWeight: 'bold'
               },
               formatter: function() {
               	  var point = this.point;
                  return point.name;
               }
            }             
         },
         column: {
         	allowPointSelect: true,
            cursor: 'pointer',
            point: {
               events: {
                  click: function() {
                     var drilldown = this.drilldown;
                     if (drilldown) { // drill down
                        setChart(chartType, drilldown.name, drilldown.categories, drilldown.data, drilldown.color);
                     } else { // restore
                        setChart(chartType, name, categories, data);
                     }
                  }
               }
            },
            dataLabels: {
               enabled: false,
               color: colors[0],
               style: {
                  fontWeight: 'bold'
               },
               formatter: function() {
               	  var point = this.point;
                  return point.name;
               }
            }             
         },
      },
      navigator: {
            enabled: false
        },
      tooltip: {
         formatter: function() {
            var point = this.point,
               s = point.name +': <b>'+ this.y +'% of time</b><br/>';
            if (point.drilldown) {
               s += 'Click to view project breakdown';
            } else {
               s += 'Click to return to task breakdown';
            }
            return s;
         }
      },
      series: [{
         name: name,
         data: data,
         color: 'white'
      }],
      exporting: {
         enabled: true
      }
   });
   
   hideLoadingBar();
});