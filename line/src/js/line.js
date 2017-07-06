var LineGraph = function(config){
	this.angle = config.angle;
	this.hoverLabel = config.hoverLabel;
	this.ratio = config.ratio;
	this.color = config.color;
	this.marginLeft = config.marginLeft;
	this.marginTop = config.marginTop;
	this.marginBottom = config.marginBottom;
	this.marginRight = config.marginRight;
	this.maintainAspect = config.maintainAspect;
	this.height = config.height;
	this.width = config.width;
	this.stroke_width = config.stroke_width;

}
var d,x,y,xAxis,yAxis,chart,height,width,line,parseTimeZ;

LineGraph.prototype.createLineGraph = function(){	
	var angle = this.angle,
		hoverLabel = this.hoverLabel,
		ratio = this.ratio,
		color = this.color,
		marginLeft = this.marginLeft,
		marginTop = this.marginTop,
		marginBottom = this.marginBottom,
		marginRight = this.marginRight,
		maintainAspect = this.maintainAspect,
		height = this.height,
		width = this.width,
		stroke_width = this.stroke_width,
		rat;
	parseTime = d3.timeParse("%Y-%m-%d");
	formatTime = d3.timeFormat("%a-%m-%y");

	var margin = {top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft};
	if(height === undefined && width === undefined ){
		rat = window.innerHeight > window.innerWidth ? window.innerWidth : window.innerHeight;
		if(window.innerHeight > window.innerWidth){
			height = rat*ratio;
			width = rat;
		}else{
			width = rat*ratio;
			height = rat;
		}
	}else{
		if(width === undefined)
			width = height*ratio;
		else if(height === undefined)
			height = width*ratio;
	}
	height = height - margin.top - margin.bottom;
	width = width - margin.left - margin.right;
	x = d3.scaleTime()
				.rangeRound([0,width]);
	y = d3.scaleLinear()
				.range([height,0]);
	xAxis = d3.axisBottom(x);
	yAxis = d3.axisLeft(y);
	var coordinates = [0, 0];
	chart = d3.select('.chart');

	if( maintainAspect === true){
		chart = chart.attr("preserveAspectRatio", "xMaxYMax meet")
					 .attr("viewBox", "0 0 " + (width + margin.left + margin.right) +  " " + (height+ margin.top + margin.bottom));
	}else{
		chart = chart.attr("height",height + margin.top + margin.bottom)
					 .attr("width",width + margin.left + margin.right)
					 .append('g')
					 .attr('transform','translate(' + margin.left + ',' + margin.top + ')');
	}
	d3.csv('./data/data.csv',function(error,data){
		d = data;
		x.domain(d3.extent(data,function(d){ return parseTime(d.Date)}));
		y.domain(d3.extent(data,function(d){ return +d.Open}));
		line = d3.line()
			.x(function(d){ return x(parseTime(d.Date))})
			.y(function(d){ return y(d.Open)});

		chart.append('g')
			.attr('class','x axis')
			.attr('transform','translate(0,' + height + ')')
			.call(xAxis);

		chart.append('g')
			.attr('class','y axis')
			.call(yAxis);

		chart.append('rect')
			 .attr('width',width)
			 .attr('height',height)
			 .attr('class','canvas')
			 .on("mousemove",function(){
				coordinates = d3.mouse(this);
				var xc = coordinates[0];
				var yc= height - coordinates[1];
				var date = new Date(x.invert(xc));
				date = formatTime(date);
				d3.selectAll('.x .curdate').remove();
				d3.select('.x').data(date).append('g').attr('class','curdate').attr('transform','translate(' + xc + ',0)').append('text').attr('y',29).text(date);
			 });
		chart.on("mouseout",function(){
			d3.selectAll('.x .curdate').remove();
		});

		d3.selectAll('.x text').attr("id",function(d,i){
			return "x"+i;
		});
		chart.append("path")
		      .datum(data)
		      .attr("fill", "none")
		      .attr("stroke", color)
		      .attr("stroke-linejoin", "round")
		      .attr("stroke-linecap", "round")
		      .attr("stroke-width", stroke_width)
		      .attr("d", line)
		      .on("mousemove",function(){
				coordinates = d3.mouse(this);
				var xc = coordinates[0];
				var yc = height - coordinates[1];
				var date = new Date(x.invert(xc));
				date = formatTime(date);
				d3.selectAll('.x .curdate').remove();
				d3.select('.x').data(date).append('g').attr('class','curdate').attr('transform','translate(' + xc + ',0)').append('text').attr('y',29).text(date);
			 });

		if(hoverLabel === true){
			chart.selectAll('.x.axis .tick text').style("fill","none");
			chart.selectAll('.x.axis .tick line').style("stroke","none");					
			chart.selectAll('.line')
			 .on("mouseover",function(d,i){
			 	d3.select('#x'+i).style("fill","black");
			 }).on("mouseout",function(d,i){
			 	d3.select('#x'+i).style("fill","none");
			 })
		}
	});		
}


LineGraph.prototype.updateLineGraph = function(){
	var angle = this.angle,
		hoverLabel = this.hoverLabel,
		color = this.color;

	var values = {};
	$.each($("#add").serializeArray(), function (i, field) {
	    values[field.name] = field.value;
	});
	d.push(values);
	var data = d;
	x.domain(data.map(function(d){ return d.name }));
	y.domain([0,d3.max(data.map(function(d){ return d.value }))]);

	var lines = chart.selectAll('.line')
					.data(data);
	d3.select('.x')
	  .call(xAxis)
	.selectAll('.tick text')
	  .call(wrap,(x.bandwidth()+8),angle,hoverLabel);

	d3.select('.y')
	  .call(yAxis);

	lines.select('rect').attr('x',function(d){ return x(d.name) })
		.attr('y',function(d){ return  y(d.value) })
		.attr("height", function(d) { return height - y(d.value); })
		.attr('width',x.bandwidth())
		.style('fill',function(d){ return color});


	lines.enter()
		.append('g')
		.attr('class','line')
		.append('rect')
		.merge(lines)
		.attr('x',function(d){ return x(d.name) })
		.attr('y',function(d){ return  y(d.value) })
		.attr("height", function(d) { return height - y(d.value); })
		.attr('width',x.bandwidth())
		.style('fill',function(d){ return color });

	d3.select('.x').selectAll('text').attr("id",function(d,i){
		return "x"+i;
	});
	if(hoverLabel === true){
		chart.selectAll('.x.axis .tick text').style("fill","none");
		chart.selectAll('.x.axis .tick line').style("stroke","none");					
		chart.selectAll('.line')
		 .on("mouseover",function(d,i){
		 	d3.select('#x'+i).style("fill","black");
		 }).on("mouseout",function(d,i){
		 	d3.select('#x'+i).style("fill","none");
		 })
	}
}



