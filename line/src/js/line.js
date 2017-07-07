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
	this.show_datap = config.show_datap;

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
		show_datap = this.show_datap,
		stroke_width = this.stroke_width,
		pad = 20,
		rat;
	parseDate = d3.timeParse("%Y-%m-%d");
	formatTime = d3.timeFormat("%d %B %Y");
	var bisectDate = d3.bisector(function(d) { return d.Date; }).left;

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
	xAxis = d3.axisBottom(x).ticks(10);
	yAxis = d3.axisLeft(y).ticks(parseInt(height / pad));

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
		data.forEach(function(d) {
		    d.Date = parseDate(d.Date);
		    d.Open = +d.Open;
		  });

		data.sort(function(a, b) {
		    return a.Date - b.Date;
		  });
		x.domain(d3.extent(data,function(d){ return d.Date}));
		y.domain(d3.extent(data,function(d){ return +d.Open}));
		line = d3.line()
			.x(function(d){ return x(d.Date)})
			.y(function(d){ return y(d.Open)});
		
		chart.append('g')
			.attr('class','x axis')
			.attr('transform','translate(0,' + height + ')')
			.call(xAxis);

    	var ticks = d3.selectAll('.x .tick').nodes().length;
    	var padding = width/ticks;
    	var max = 0;
    	d3.selectAll('.x .tick').each(function(d){
    			var check = d3.select(this).select('text').node().getComputedTextLength();
    			if(check > max){
    				max = check;
    			}
    		}
    	);
    	padding = parseInt(width/(ticks));
		if( padding < max ){
			xAxis.ticks( 7 );
			d3.select('.x').call(xAxis);
		}

		chart.append('g')
			.attr('class','y axis')
			.call(yAxis);

    	d3.select('.y.axis .tick text').attr("font-size","10px");

			 
		 var focus = chart.append("g")
				      .attr("class", "focus")
				      .style("display", "none");
		if(!show_datap){
			focus.append("circle")
	      		.attr("r", 4.5);
      	}

	    focus.append("text")
	        .attr("x", 9)
	        .attr("dy", ".35em");

	    if(show_datap){
			chart.append('g').selectAll('circle')
				 .data(data)
				 .enter()
				 .append('circle')
				 .attr('r',2)
				 .attr('cx',function(d){ return x(d.Date)})
				 .attr('cy',function(d){return y(d.Open)})
				 .attr('fill','red')
				 .attr('stroke','red');
		}

		d3.selectAll('.x text').attr("id",function(d,i){
			return "x"+i;
		});
		chart.append("path")
		      .datum(data)
		      .attr("class", "line1")
		      .attr("fill", "none")
		      .attr("stroke", color)
		      .attr("stroke-linejoin", "round")
		      .attr("stroke-linecap", "round")
		      .attr("stroke-width", stroke_width)
		      .attr("d", line)

		chart.on("mouseout",function(){
			d3.selectAll('.x .curdate').remove();
			chart.selectAll(".curline").remove();
		});
			chart.append("rect")
			      .attr("class", "overlay")
			      .attr("width", width)
			      .attr("height", height)
			      .on("mouseover", function() { focus.style("display", null); })
			      .on("mouseout", function() { focus.style("display", "none"); })
			      .on("mousemove", mousemove);

			function mousemove() {
				coordinates = d3.mouse(this);
				var xc = coordinates[0];
				var yc= height - coordinates[1];
				var coord = {"x":xc,"y":yc}
				var date = new Date(x.invert(xc));
				date = formatTime(date);
				d3.selectAll('.x .curdate').remove();
				d3.select('.x')
					.data(date)
					.append('g')
					.attr('class','curdate')
					.attr('transform','translate(' + xc + ',0)')
					.append('text')
					.attr('y',29)
					.text(date);
				var pos = xc;
			    var x0 = x.invert(d3.mouse(this)[0]),
			        i = bisectDate(data, x0, 1),
			        d0 = data[i - 1],
			        d1 = data[i],
			        d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;
			        formatTime = d3.timeFormat("%Y-%d-%m");
			    	x0 = formatTime(x0);
			    focus.attr("transform", "translate(" + x(d.Date) + "," + y(d.Open) + ")");
			    focus.select("text").text(d.Open);
			    
			    chart.select(".curline").remove();
				chart.append('line')
						.attr("class","curline")
					    .style('stroke', 'black')
					    .style('stroke-width',1.5)
					    .attr('x1', x(d.Date))
					    .attr('y1', height)
					    .attr('x2', x(d.Date))
					    .attr('y2', y(d.Open));
			  }
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
