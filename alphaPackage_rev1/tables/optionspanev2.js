"use strict";

var paramWidth = 300;
var paramHeight = 300;

$(document).ready(setup);
//handles events from html page

var selections;
var currentTab;
var graphSelection;

function setup() {
	var info = data.getColumns();
	selections = jQuery.parseJSON(info);
	populateSettings(); 
	$('#scaling_buttons').hide();
}

function populateSettings() {
	currentTab = "selectgraph";
	$("#selectgraph").hide();
	$("#selectgraph").addClass("defaultoption");
	$("#selectgraph").addClass("category");
	$('#title').html("Select a graph type");
	$("#selectgraph").append($(createTitle("Graph Type")));
	$("#selectgraph").append($(createItem("Bar Graph", "graphtype", "graphtype")));
	$("#selectgraph").append($(createItem("Line Graph", "graphtype", "graphtype")));
	$("#selectgraph").append($(createItem("Scatter Plot", "graphtype", "graphtype")));
	$($("#selectgraph").children()).hide();
	var graphType = graph_data.getGraphType();
	loadFromKeyValueStore($("#selectgraph"), graphType);
}

//does not work with keystore
function populateOperationSettings() {
	if($("#operation").children().length == 0) {
		$("#operation").hide();
		$("#operation").addClass("defaultoption");
		$("#operation").addClass("category");
		currentTab = "operation";
		$('#title').html("Select an aggregation");
		$("#operation").append($(createTitle("Operation")));
		$("#operation").append($(createItem("Simple Plot", "operation", "operation")));
		$("#operation").append($(createItem("Count", "operation", "operation")));
		$("#operation").append($(createItem("Sum", "operation", "operation")));
		$("#operation").append($(createItem("Average", "operation", "operation")));
		$("#operation").append($(createItem("Max", "operation", "operation")));
		$("#operation").append($(createItem("Min", "operation", "operation")));
		$($("#operation").children()).hide();
		var graphOperation = graph_data.getGraphOp();
		loadFromKeyValueStore($("#operation"), graphOperation);
		return true;
	}
	return false;
}

function populateXSettings() {
	if($("#selectx").children().length == 0) {
		$("#selectx").hide();
		$("#selectx").addClass("defaultoption");
		$("#selectx").addClass("category");
		currentTab = "selectx";
		$('#title').html("Select an x axis");
		$("#selectx").empty();
		$("#selectx").append($(createTitle("X axis")));
		for(var k in selections) {
			$("#selectx").append($(createItem(k, selections[k], "selectx")));
		}
		$($("#selectx").children()).hide();
		manageInvalidInputs();
		
		var graphX = graph_data.getGraphXAxis();
		loadFromKeyValueStore($("#selectx"), graphX);
		return true;
	}
	return false;
}

function populateYSettings() {	
	if($("#selecty").children().length == 0) {
		$('#selecty').hide();
		$("#selecty").addClass("defaultoption");
		$("#selecty").addClass("category");
		currentTab = "selecty";
		$('#title').html("Select a y axis");
		$("#selecty").empty();
		$("#selecty").append($(createTitle("Y axis")));
		for(var k in selections) {
			$("#selecty").append($(createItem(k, selections[k], "selecty")));
		}
		$($("#selecty").children()).hide();
		manageInvalidInputs();
		var graphY = graph_data.getGraphYAxis();
		loadFromKeyValueStore($("#selecty"), graphY);	
		return true;
	}
	return false;
}

function populateRSettings() {	
	if($("#selectr").children().length == 0) {
		$('#selectr').hide();
		$("#selectr").addClass("scatterplot");
		$("#selectr").addClass("category");
		currentTab = "selectr";
		$('#title').html("scale the points by");
		$("#selectr").empty();
		$("#selectr").append($(createTitle("Scale Points")));
		$("#selectr").append($(createItem("No Scaling", "Number", "selectr")));
		for(var k in selections) {
			$("#selectr").append($(createItem(k, selections[k], "selectr")));
		}
		$($("#selectr").children()).hide();
		manageInvalidInputs();
		var graphR = graph_data.getGraphRAxis();
		loadFromKeyValueStore($("#selectr"), graphR);	
		return true;
	}
	return false;
}

function loadFromKeyValueStore(category, key) {
	if(key == "") {
		rollDownNewOptions(category);
	} else {
		var prevEl = category.children().filter(function() {
			return $(this).text() == key;
		});
		category.show();
		category.children(".title").show();
		category.children(":not(.invalid)").show();
		prevEl.click();
	}
}

function rollDownNewOptions(form) {
	form.show();
	form.children(".title").show();
	form.children(":not(.invalid)").slideDown('slow', function() {});
}

function createTitle(title) {
	var div = document.createElement("div");
	$(div).addClass("title");
	$(div).append("<p class=\"label\">" + title + "</p>");
	return div;
}

function deactivateTitle(title) {
	$(title).animate({
		fontSize: '18pt',
	}, 200, function() {});
}

function activateTitle(title) {
	$(title).animate({
		fontSize: '26pt',
	}, 200, function() {});
}

function createItem(text, type, kvstoreval) {
	var div = document.createElement("div");
	$(div).addClass("listing");
	$(div).addClass(type);
	$(div).addClass("unselected");
	$(div).attr('id', text);
	$(div).append("<p class=\"label\">" + text + "</p>");
	$(div).toggle(function() {
		//closing file
		if($("#title").hasClass("edit_button")) {
			$("#title").html("Edit");
		}
		currentTab = "none";
		$(div).removeClass("unselected");
		$(div).addClass("selected");
		//Save the selection in Key Value Store
		graph_data.saveSelection(kvstoreval, text);
		$(div).siblings(".unselected").slideUp('slow');
		$(div).promise().done(function() {
			$(div).siblings(".unselected").removeClass("previous");
			$(div).animate({
				fontSize: '14pt',
			}, 200, function() {});
			deactivateTitle($(div).siblings(".title"));
			if(!$(div).hasClass("previous")) {
				dispatchNextFolder($(div).parent().attr('id'), $(div).attr('id'));
			}
		});
		
	}, function() {
		//opening file
		//if the tab being opened is not the current tab, select a default
		//value in that tab and open the new one.
		$(div).animate({
			fontSize: '24pt',
		}, 200, function() {
			$(div).siblings(":not(.invalid)").slideDown('slow');
			if(currentTab != "none" && currentTab != $(div).parent().attr('id')) {
				if($("#" + currentTab).find('.previous').length > 0) {
					$("#" + currentTab).find('.previous').click();
				}
				else {
					var noneDiv = $(createItem("none", currentTab, kvstoreval));
					$("#" + currentTab).children(".title").after(noneDiv);
					$(noneDiv).addClass("none");
					$(noneDiv).click();
				}
			}
			currentTab = $(div).parent().attr('id');
			selectTitle();
			if($(div).hasClass("none")) {
				$(div).remove();
			}
		});
		activateTitle($(div).siblings(".title"));
		$(div).removeClass("selected");
		$(div).addClass("unselected");
		$(div).addClass("previous");
	});
	return div;
}

function selectTitle() {
	if(currentTab == "selectgraph") {
		$('#title').html("Select a graph type");
	}
	else if(currentTab == "selectx") {
		$('#title').html("Select an x axis");
	}
	else if(currentTab == "selecty") {
		$('#title').html("Select a y axis");
	}
	else if(currentTab == "selectr") {
		$('#title').html("Select a scale");
	}
	else if(currentTab == "operation") {
		$('#title').html("Select an operation");
	}
}

function dispatchNextFolder(form, folder) {
	if($('#selectgraph').children('.selected').length != 0) {
		graphSelection = $('#selectgraph').children('.selected')[0].id;
	}
	if($('.none').length == 0) {
		if(graphSelection == "Bar Graph") {
			$(".category:not(.defaultoption)").hide();
			if(folder == "Bar Graph") {
				if(!populateOperationSettings()) {
					form = "operation";
				}
			}
			if(form == "operation") {
				if(!populateXSettings()) {
					form = "selectx";
				}
			}
			if(form == "selectx") {
				if($("#operation").children(".selected")[0].id == "Count") {
					$("#selecty").hide();
					packageEditMenu();
				}
				else if(!populateYSettings()) {
					form = "selecty";
				}
			}
			if(form == "selecty") {
				$("#selecty").show();
				packageEditMenu();
			}
		}
		else if(graphSelection == "Scatter Plot") {
			$(".category:not(.defaultoption, .scatterplot)").hide();
			if($("#title").hasClass("edit_button")) {
				$(".scatterplot").show();
			}
			if(folder == "Scatter Plot") {
				if(!populateOperationSettings()) {
					form = "operation";
				}
			}
			if(form == "operation") {
				if(!populateXSettings()) {
					form = "selectx";
				}
			}
			if(form == "selectx") {
				var operation = $("#operation").children(".selected")[0].id;
				if(operation == "Count") {
					packageEditMenu();
				}
				else if(!populateYSettings()) {
					form = "selecty";
				}
			}
			if(form == "selecty") {
				if(!populateRSettings()) {
					form = "selectr";
				}
			}
			if(form == "selectr") {
				packageEditMenu();
			}
		}
		manageInvalidInputs();
	}
}

function packageEditMenu() {
	if(!$("#title").hasClass("edit_button")) {
		$("#title").html("Edit");
		$("#title").addClass("edit_button");
		$("#title").toggle(function() {
			$("#title").html("Edit");
			
			$("#title").siblings().slideUp('slow', function() {
				$('#scaling_buttons').slideDown('fast', function() {});
			});
		
		},
		function() {
			$("#title").html("Edit");
			$("#title").siblings().slideDown('slow', function() {});
			$('#scaling_buttons').slideUp('slow', function() {});
		});
		$("#title").click();
	}
	if($("#title").hasClass("edit_button")) {
		$("#title").promise().done(function() {
			selectGraph();
		});
	}
}

function manageInvalidInputs() {
	$(".invalid").removeClass("invalid");
	var operation = "";
	if($("#operation").children(".selected").length > 0) {
		operation = $("#operation").children(".selected")[0].id;
	}
	if ($("#selectgraph").children(".selected")[0].id == "Bar Graph") {
		if (operation != "Count") {
			$("#selecty").children(':not(.Number, .title)').addClass("invalid");
		}
	} else if ($("#selectgraph").children(".selected")[0].id == "Scatter Plot") {
		if(operation != "Count") {
			$("#selectx").children(':not(.Number, .title)').addClass("invalid");
			$("#selecty").children(':not(.Number, .title)').addClass("invalid");
			$("#selectr").children(':not(.Number, .title)').addClass("invalid");
		}
	}
}

function selectGraph() {
	$('#svg_body').html("");
	$('.scale_button').off('click');
	var graphType = $("#selectgraph").children(".selected")[0].id;
	var xString = $('#selectx').children('.selected')[0].id;
	var operation = $("#operation").children(".selected")[0].id;
	if(graphType == "Bar Graph") {
		if(operation == "Count") {
			drawGraph(countGraphData(), xString, "Count");
		} else {
			var yString = $('#selecty').children('.selected')[0].id;
			if (operation == "Sum") {
				drawGraph(sumGraphData(), xString, yString);
			} else if (operation == "Average") {
				drawGraph(avgGraphData(), xString, yString);
			} else if (operation == "Min") {
				drawGraph(minGraphData(), xString, yString);
			} else if (operation == "Max") {
				drawGraph(maxGraphData(), xString, yString);
			} else {
				drawGraph(avgGraphData(), xString, yString);
			}
		}
	}
	else if(graphType == "Scatter Plot") {
		if (operation == "Count") {
			drawScatter(countScatterData(), xString, yString);
		} else {
			var yString = $('#selecty').children('.selected')[0].id;
			if (operation == "Min") {
				drawScatter(minGraphData(), "No Scaling", xString, yString);
			} else if (operation == "Max") {
				drawScatter(maxGraphData(), "No Scaling", xString, yString);
			} else if (operation == "Sum") {
				drawScatter(sumGraphData(), "No Scaling", xString, yString);
			} else if (operation == "Average") {
				drawGraph(avgGraphData(), "No Scaling", xString, yString);
			} else {
				drawScatter(getSimplePlotScatterData(), $('#selectr').children('.selected')[0].id, xString, yString);
			}
		}
	}
}

function countScatterData() {
	var xString = $('#selectx').children('.selected')[0].id;
	var names = JSON.parse(data.getColumnData(xString));
	var dataJ = new Array();
	var tempSpot = new Array();
	for(var j = 0; j < names.length; j++) {
		if(!(names[j] in tempSpot)) {
			tempSpot[names[j]] = 0;
		}
		tempSpot[names[j]]++;
	}
	var avg = 2;
	var i = 0;
	for (var key in tempSpot) {
		if( tempSpot.hasOwnProperty( key ) ) {
			dataJ[i] = {x:i + 1, y:tempSpot[key], r:avg};
			i++;
		} 
    }
	return dataJ;
}

function countScatterData() {
	var xString = $('#selectx').children('.selected')[0].id;
	var names = JSON.parse(data.getColumnData(xString));
	var dataJ = new Array();
	var tempSpot = new Array();
	for(var j = 0; j < names.length; j++) {
		if(!(names[j] in tempSpot)) {
			tempSpot[names[j]] = 0;
		}
		tempSpot[names[j]]++;
	}
	var avg = 2;
	var i = 0;
	for (var key in tempSpot) {
		if( tempSpot.hasOwnProperty( key ) ) {
			dataJ[i] = {x:i + 1, y:tempSpot[key], r:avg};
			i++;
		} 
    }
	return dataJ;
}

function getSimplePlotScatterData() {
	var xString = $('#selectx').children('.selected')[0].id;
	var yString = $('#selecty').children('.selected')[0].id;
	var rString = $('#selectr').children('.selected')[0].id;
	//var paramWidth = 0;
	//var paramHeight = 0;
	var names = JSON.parse(data.getColumnData(xString));
	var values = JSON.parse(data.getColumnData(yString));
	var size;
	if(rString != "No Scaling") {
		size = JSON.parse(data.getColumnData(rString));
	} else {
		size = new Array();
		for(var k = 0; k < names.length; k++) {
			size[k] = 20;
		}
	}
	var dataJ = new Array();
	if(size != "") {
		for(var j = 0; j < names.length; j++) {
			dataJ[j] = {x:names[j], y:values[j], r:size[j]};
		}
	}
	else {
		for(var j = 0; j < names.length; j++) {
			dataJ[j] = {x:names[j], y:values[j], r:size[j]};
		}
	}
	return dataJ;
}

function drawScatter(dataJ, rString, xString, yString) {
	var margin = {top: 20, right: 20, bottom: 40, left: 50};

//	Width and height
	var vWidth = paramWidth;
	var vHeight = paramHeight;
	var padding = 30;

	dataJ.forEach(function(d) {
		d.x = +d.x;
		d.y = +d.y;
		d.r = +d.r;
	});
	
	var x = d3.scale.ordinal()
		.rangeRoundBands([0, vWidth], .1);

	var y = d3.scale.linear()
		.range([vHeight, 0]);
		
	x.domain([0, d3.max(dataJ, function(d) { return d.x; })]);
	y.domain([0, d3.max(dataJ, function(d) { return d.y; })]);
	
	//		Create scale functions
	var xScale = d3.scale.linear()
	.domain([0, d3.max(dataJ, function(d) { return d.x; })])
	.range([padding, vWidth - padding * 2]);

	var yScale = d3.scale.linear()
	.domain([0, d3.max(dataJ, function(d) { return d.y; })])
	.range([vHeight - padding, padding]);
	
	var rScale = d3.scale.linear()
	.domain([0, d3.max(dataJ, function(d) { return d.y; })])
	.range([2, 5]);
	
	//		Define X axis
	var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom")
	.ticks(5);

//		Define Y axis
	var yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left")
	.ticks(5);
	
	
	function draw() {
		d3.selectAll(".wholeBody").remove();
		
	//	Create SVG element
		var svg = d3.select("#svg_body")
		.append("svg")
		.attr("class", "wholeBody")
		.attr("width", vWidth + margin.left + margin.right)
		.attr("height", vHeight + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");
		
		x.rangeRoundBands([0, vWidth], .1);
		y.range([vHeight, 0]);
		
		yScale.range([vHeight - padding, padding]);
		xScale.range([padding, vWidth - padding * 2]);
		
	//		Create circles
		svg.selectAll("circle")
		.data(dataJ)
		.enter()
		.append("circle")
		.attr("cx", function(d) {
			return xScale(d.x);
		})
		.attr("cy", function(d) {
			return yScale(d.y);
		})
		.attr("r", function(d) {
			return rScale(4);
		})
		.attr("fill", function(d) {
			if(rString != "No Scaling") {
				return data.getForegroundColor(rString, d.r);
			} else {
				return "black";
			}
		});

	//		Create X axis
		svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (vHeight - padding) + ")")
		.call(xAxis)
		.append("text")
		.attr("x", vWidth/2-50)
		.attr("y", 35)
		.style("font-size", "1.5em")
		.style("text-anchor", "start")
		.text(xString);

	//		Create Y axis
		svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -35)
		.attr("x", -1 * vHeight/2)
		.style("font-size", "1.5em")
		.style("text-anchor", "end")
		.text(yString);
	}
	draw();
	
	$('#y_up').click(function(){
		vHeight = vHeight + (vHeight * .2);
		draw();
	});
	$('#y_down').click(function(){
		vHeight = vHeight - (vHeight * .2);
		draw();
	});
	$('#x_up').click(function(){
		vWidth = vWidth + (vWidth * .2);
		draw();
	});
	$('#x_down').click(function(){
		vWidth = vWidth - (vWidth * .2);	
		draw();
	});
}

function sumGraphData() {
	var xString = $('#selectx').children('.selected')[0].id;
	var yString = $('#selecty').children('.selected')[0].id;
	//var paramWidth = 0;
	//var paramHeight = 0;
	var names = JSON.parse(data.getColumnData(xString));
	var values = JSON.parse(data.getColumnData(yString));
	var dataJ = new Array();
	var tempSpot = new Array();
	
	for(var j = 0; j < names.length; j++) {
		if(!(names[j] in tempSpot)) {
			tempSpot[names[j]] = 0;
		}
		
		tempSpot[names[j]] += +values[j];
	}
	var i = 0;
	var avg = 2;
	for (var key in tempSpot) {
		if( tempSpot.hasOwnProperty( key ) ) {
			dataJ[i] = {x:key, y:tempSpot[key], r:avg};
			i++;
		} 
    }
	return dataJ; 
}


function avgGraphData() {
	var xString = $('#selectx').children('.selected')[0].id;
	var yString = $('#selecty').children('.selected')[0].id;
	//var paramWidth = 0;
	//var paramHeight = 0;
	var names = JSON.parse(data.getColumnData(xString));
	var values = JSON.parse(data.getColumnData(yString));
	var dataJ = new Array();
	var tempSpot = new Array();
	var divis = new Array();
	
	for(var j = 0; j < names.length; j++) {
		if(!(names[j] in tempSpot)) {
			tempSpot[names[j]] = 0;
			divis[names[j]] = 0;
		}
		tempSpot[names[j]] += +values[j];
		divis[names[j]]++;
	}
	var i = 0;
	var avg = 2;
	for (var key in tempSpot) {
		if( tempSpot.hasOwnProperty( key ) ) {
			var divValue = (tempSpot[key])/(divis[key]);
			dataJ[i] = {x:key, y:divValue, r:avg};
			i++;
		} 
    }
	return dataJ; 
}

function minGraphData() {
	var xString = $('#selectx').children('.selected')[0].id;
	var yString = $('#selecty').children('.selected')[0].id;
	//var paramWidth = 0;
	//var paramHeight = 0;
	var names = JSON.parse(data.getColumnData(xString));
	var values = JSON.parse(data.getColumnData(yString));
	var dataJ = new Array();
	var tempSpot = new Object();
	
	for(var j = 0; j < names.length; j++) {
		if(!(names[j] in tempSpot)) {
			tempSpot[names[j]] = values[j];
		}
		if(+tempSpot[names[j]] > +values[j]) {
			tempSpot[names[j]] = values[j];
		}
	}
	var i = 0;
	var avg = 2;
	for (var key in tempSpot) {
		if( tempSpot.hasOwnProperty( key ) ) {
			dataJ[i] = {x:key, y:tempSpot[key], r:avg};
			i++;
		} 
    }
	return dataJ; 
}

function maxGraphData() {
	var xString = $('#selectx').children('.selected')[0].id;
	var yString = $('#selecty').children('.selected')[0].id;
	//var paramWidth = 0;
	//var paramHeight = 0;
	var names = JSON.parse(data.getColumnData(xString));
	var values = JSON.parse(data.getColumnData(yString));
	var dataJ = new Array();
	var tempSpot = new Array();
	
	for(var j = 0; j < names.length; j++) {
		if(!(names[j] in tempSpot)) {
			tempSpot[names[j]] = values[j];
		}
		if(+tempSpot[names[j]] < +values[j]) {
			tempSpot[names[j]] = values[j];
		}
	}
	var i = 0;
	var avg = 2;
	for (var key in tempSpot) {
		if( tempSpot.hasOwnProperty( key ) ) {
			dataJ[i] = {x:key, y:tempSpot[key], r:avg};
			i++;
		} 
    }
	return dataJ; 
}


function countGraphData() {
	var xString = $('#selectx').children('.selected')[0].id;
	var names = JSON.parse(data.getColumnData(xString));
	var dataJ = new Array();
	var tempSpot = new Array();
	for(var j = 0; j < names.length; j++) {
		if(!(names[j] in tempSpot)) {
			tempSpot[names[j]] = 0;
		}
		tempSpot[names[j]]++;
	}
	var i = 0;
	for (var key in tempSpot) {
		if( tempSpot.hasOwnProperty( key ) ) {
			dataJ[i] = {x:key, y:tempSpot[key]};
			i++;
		} 
    }
	return dataJ;
}

function simpleGraphPlotData() {
	var xString = $('#selectx').children('.selected')[0].id;
	var yString = $('#selecty').children('.selected')[0].id;
	//var paramWidth = 0;
	//var paramHeight = 0;
	var names = JSON.parse(data.getColumnData(xString));
	var values = JSON.parse(data.getColumnData(yString));
	var dataJ = new Array();
	for(var j = 0; j < names.length; j++) {
		dataJ[j] = {x:names[j], y:values[j]};
	}
	return dataJ;
}

function drawGraph(dataJ, xString, yString) {
	var margin = {top: 20, right: 20, bottom: 40, left: 50},
	width = paramWidth - margin.left - margin.right,
	height = paramHeight - margin.top - margin.bottom;
	var x = d3.scale.ordinal()
	.rangeRoundBands([0, width], .1);

	var y = d3.scale.linear()
	.range([height, 0]);

	var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

	var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left")
	.tickSubdivide(true)
	dataJ.forEach(function(d) {
			d.y = +d.y;
		});
		
		x.domain(dataJ.map(function(d) { return d.x; }));
		y.domain([0, d3.max(dataJ, function(d) { return d.y; })]);
	var vWidth = width;
	var vHeight = height;
	var downx = 0;
	var downy = Math.NaN;
	var isClicked = 0;
    var downscalex;
	var downscaley;
	var clickX;
	var clickY;
	var lMarg = 0;
	var tMarg = 0;
	var svg;
	
	function draw(nDiff, yDiff) {
		d3.selectAll(".wholeBody").remove();
		
		var tempHeight = vHeight + yDiff;
		x.rangeRoundBands([0, vWidth + nDiff], .2);
		y.range([tempHeight, 0]);
		yAxis.ticks(tempHeight/30);
		
		svg = d3.select("#svg_body").append("svg")
		.attr("id", "svgElement")
		.attr("class", "wholeBody")
		.attr("z-index", 1)
		.attr("width", vWidth + margin.left + margin.right + nDiff)
		.attr("height", vHeight + margin.top + margin.bottom + yDiff)
		.append("g")
		.attr("transform", "translate(" + (margin.left + lMarg) + "," + (margin.top + tMarg) + ")");
		
		svg.append("g")
		.attr("class", "x_axis")
		.attr("z-index", 4)
		.attr("transform", "translate(0," + tempHeight + ")")
		.call(xAxis)
		.append("text")
		.attr("x", vWidth/2-50)
		.attr("y", 35)
		.attr("dx", ".71em")
		.attr("pointer-events", "all")
		.style("font-size", "1.5em")
		.style("text-anchor", "start")
		.text(xString);
		
		svg.append("g")
		.attr("class", "y_axis")
		.attr("z-index", 4)
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -35)
		.attr("x", -1 * tempHeight/2)
		.style("font-size", "1.5em")
		.style("text-anchor", "end")
		.text(yString);
		
		 var lines = svg.selectAll(".bar")
          .data(dataJ);
      lines.exit().remove();
      lines.enter()
        .append("rect")
          .attr("class", "bar")
		  .attr("width", x.rangeBand())
		  .attr("fill", function(d) { 
			return data.getForegroundColor(yString, d.y);
		});
      lines
          .attr("x", function(d) { return x(d.x); })
          .attr("y", function(d) { return y(d.y); })
		  .attr("height", function(d) { return tempHeight - y(d.y); });
		  
	}
	draw(0, 0);
	$('#y_up').click(function(){
		vHeight = vHeight + (vHeight * .2);
		draw(0, 0);
	});
	$('#y_down').click(function(){
		vHeight = vHeight - (vHeight * .2);
		draw(0, 0);
	});
	$('#x_up').click(function(){
		vWidth = vWidth + (vWidth * .2);
		draw(0, 0);
	});
	$('#x_down').click(function(){
		vWidth = vWidth - (vWidth * .2);	
		draw(0, 0);
	});
	
	/*
	var waitDraw = _.throttle(function(hasMoved) {
			var v = diffN;
			var y = diffY;
			if(vWidth + v > 0 && vHeight + y > 0) {
				draw(v, y);
			} else if(hasMoved) {
				draw();
			}
		}, 100);
	
	var prevRupx = Number.NaN;
	var prevRupy = Number.NaN;
	var diffN = 0;
	var diffY = 0;
	var prevDiffN = 0;
	var prevDiffY = 0;
	var eventTime = 0;
	
	var hammertime = Hammer(document.body).on("pinch", function(event) {
		event.gesture.stopPropagation();
		var direction = event.gesture.direction;
		data.logData("" + event.gesture.scale);
		var rupx = Math.round((width*event.gesture.scale)/2);
			if(isNaN(prevRupx)) {
				prevRupx = rupx;
			}
			var relDiff = rupx - prevRupx;
			if(!isNaN(relDiff) && prevRupx != rupx) {
				diffN += relDiff;
				diffY += relDiff;
				prevRupx = rupx;
			}
		*//*if(direction == "right" || direction == "left") {
			var rupx = Math.round((width*event.gesture.scale)/2);
			if(isNaN(prevRupx)) {
				prevRupx = rupx;
			}
			var relDiff = rupx - prevRupx;
			if(!isNaN(relDiff) && prevRupx != rupx) {
				diffN += relDiff;
				prevRupx = rupx;
			}
		} if(direction == "up" || direction == "down") {
			var rupy = Math.round((width*event.gesture.scale)/2);
			if(isNaN(prevRupy)) {
				prevRupy = rupy;
			}
			var relDiff = rupy - prevRupy;
			if(!isNaN(relDiff) && prevRupy != rupy) {
				diffY += relDiff;
				prevRupy = rupy;
			}
		}*//*
		waitDraw();
    }).on("release", function(event) {
		prevRupx = Number.NaN;
		prevRupy = Number.NaN;
		vWidth += diffN;
		vHeight += diffY;
		diffN = 0;
		diffY = 0;
		event.gesture.stopDetect();
		
	});*//*.on("drag", function(event) {
		lMarg += Math.round(event.gesture.deltaX/30);
		tMarg += Math.round(event.gesture.deltaY/30);
		if(lMarg + margin.left <= margin.left && tMarg + margin.top >= margin.top) {
			waitDraw(true);
		}
	});*/
	
	//waitDraw();
	
}