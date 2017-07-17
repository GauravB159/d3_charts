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
var d,x,y,xAxis,yAxis,chart,height,width,line,parseTime;

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

LineGraph.prototype.createLineGraph = function(xaxis,yaxis){	
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
	var bisectDate = d3.bisector(function(d) { return d[xaxis]; }).left;

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
	yAxis = d3.axisLeft(y).tickFormat(function(e){
        if(Math.floor(e) != e)
        {
            return;
        }

        return e;
    });

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
	var color =  d3.scaleOrdinal(d3.schemeCategory10);

	var focus = chart.append("g")
		      .attr("class", "focus")
		      .style("display", "none");

	if(!show_datap){
		focus.append("circle")
	  		.attr("r", 4.5);
	}


	d3.csv('./data/data3.csv',function(error,data){
		d = data;

		var keys = d3.keys(data[0]).filter(function(key){ return key !== xaxis});
		data.forEach(function(d){
			d[xaxis] = parseDate(d[xaxis]);
		});

		var tooltip = focus.append('rect')
							.attr('height',((keys.length + 1) * 20) + 'px')
							.attr('width','120px')
							.style('fill','rgb(0,0,0)');

		var max = d[0][keys[0]];
		var min = d[0][keys[0]];
		data.forEach(function(d){
			keys.forEach(function(key){
				if(d[key] > max){
					max = d[key];
				}
				if(d[key] < min){
					min = d[key];
				}
			})
		});

		min = Math.round(min);
		max = Math.round(max);
		x.domain(d3.extent(data,function(d){ return d[xaxis]}));
		y.domain([min,max]);
		chart.append('g')
			.attr('class','x axis')
			.attr('transform','translate(0,' + height + ')')
			.call(xAxis);

		chart.append('g')
			.attr('class','y axis')
			.call(yAxis);
		var i;
		var newMin = min;
		var newMax = max;

		for(i = min;i < max;i++){
			var arr = d3.selectAll('.y .tick text')
						.nodes();
			if( parseInt(arr[0].innerHTML) < min && parseInt(arr[arr.length - 1].innerHTML) > max)
			{
				break;
			}else if(parseInt(arr[0].innerHTML) < min){
				y.domain([newMin,newMax+1]);
			}else if(parseInt(arr[arr.length - 1].innerHTML) > max){
				y.domain([newMin-1,newMax]);
			}else{
				y.domain([newMin-1,newMax+1]);
			}
			newMin--;
			newMax++;
			chart.select('.y.axis').call(yAxis);
		}

		data.sort(function(a, b) {
			return a[xaxis] - b[xaxis];
		});
		color.domain(keys.map(function(c,index) { return index; }));
		keys.forEach(function(key,index){

			data.forEach(function(d) {
			    d[key] = +d[key];
			  });
			line = d3.line()
				.x(function(d){ return x(d[xaxis])})
				.y(function(d){ return y(d[key])});
			
			
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
				xAxis.ticks( 4 );
				d3.select('.x').call(xAxis);
			}

			

	    	d3.selectAll('.axis .tick text')
	    		.attr("font-size","12px")
	    		.style('font-family','Lato');

	    	d3.selectAll('.y .tick text').nodes().forEach(function(d){
	    		if(d.innerHTML === ""){
	    			d3.select(d.parentNode).select('line').remove();
	    		}
	    	});
			d3.selectAll('.x text').attr("id",function(d,i){
				return "x"+i;
			});
			var path = chart.append("path")
			      .datum(data)
			      .attr("class", "line line" + index)
			      .style("stroke", function(d) { return color(index); })
			      .attr("stroke-linejoin", "round")
			      .attr("stroke-linecap", "round")
			      .attr("stroke-width", stroke_width)
			      .attr("d", line);

			var totalLength = path.node().getTotalLength();
		    path
		      .attr("stroke-dasharray", totalLength + " " + totalLength)
		      .attr("stroke-dashoffset", totalLength)
		      .transition()
		        .duration(4000)
		        .attr("stroke-dashoffset", 0);

		    setTimeout(function(){
			    if(show_datap){
					chart.append('g').selectAll('circle')
						 .data(data)
						 .enter()
						 .append('circle')
						 .attr('r',2)
						 .attr('cx',function(d){ return x(d[xaxis])})
						 .attr('cy',function(d){return y(d[key])})
						 .attr('class',index)
						 .attr('stroke', function(d){return d3.select('.line' + d3.select(this).attr('class')).style('stroke') })	
						 .attr('fill', function(d){return d3.select('.line' + d3.select(this).attr('class')).style('stroke') });
				}

			// chart.on("mouseout",function(){
			// 	d3.selectAll('.x .curdate').remove();
			// 	chart.selectAll(".curline").remove();
			// });

			chart.append("rect")
			      .attr("class", "overlay")
			      .attr("width", width)
			      .attr("height", height)
			      .on("mouseover", function() { focus.style("display", null); })
			      //.on("mouseout", function() { focus.style("display", "none"); })
			      .on("mousemove", mousemove);

			var texts = focus.append('g');
			texts.append('rect')
				.attr('class','toolegend')
				.attr('height','15px')
				.attr('width','15px')
				.style('stroke','white')
				.style('fill', function(d) { return color(index); });

			texts.append('text')
				.attr('class','tooltext')
				.style('fill','white')
				.style('font-size','14px');

				function mousemove() {
					

					coordinates = d3.mouse(this);
					focus.moveToFront();
					var xc = coordinates[0];
					var yc= height - coordinates[1];
					var coord = {"x":xc,"y":yc}
					var date = new Date(x.invert(xc));
					date = formatTime(date);
					
					var pos = xc;
				    var x0 = x.invert(d3.mouse(this)[0]),
				        i = bisectDate(data, x0, 1),
				        d0 = data[i - 1],
				        d1 = data[i],
				        d = x0 - d0[xaxis] > d1[xaxis] - x0 ? d1 : d0;
				        formatTime = d3.timeFormat("%Y-%d-%m");
				    	x0 = formatTime(x0);
				    	var max = 0;
				    	keys.forEach(function(key){
				    		if(d[key] > max )
				    			max = d[key];
				    	});

				    d3.selectAll('.x .curdate').remove();
					d3.select('.x')
						.data(date)
						.append('g')
						.attr('class','curdate')
						.attr('transform','translate(' + xc + ',0)')
						.append('text')
						.attr('y',29)
						.text(formatTime(d[xaxis]));

				    focus.attr("transform", "translate(" + x(d[xaxis]) + "," + (y(max) - ((keys.length + 1) * 20)) + ")");
				    focus.select('.title').remove();
					focus.insert("text",":first-child")
						.style('fill','white')
						.attr('class','title')
						.style('font-size','14px')
						.style('font-family','Lato')
						.attr('dy','15px')
						.text(formatTime(d[xaxis]))
						.moveToFront();

				    focus.selectAll(".tooltext")
					    .attr('dx','15px')
					    .attr('dy',function(de,i){ var yoff = 17*(i+2); return yoff+'px'})
					    .style('font-family','Lato')
				    	.text(function(de,i){ return keys[i] + " : " + d3.format('.2f')(d[keys[i]]) });

				    focus.selectAll(".toolegend")
					    .attr('dx','15px')
					    .attr('margin-top','5px')
					    .attr('y',function(de,i){ var yoff = 19*(i+1); return yoff+'px'})

				    chart.select(".curline").remove();

					chart.append('line')
						.attr("class","curline")
					    .style('stroke', '#666')
					    .style('stroke-width',1.5)
					    .attr('x1', x(d[xaxis]))
					    .attr('y1', height)
					    .attr('x2', x(d[xaxis]))
					    .attr('y2', y(max));
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
		}
		,3900);
		});
	});	
}
