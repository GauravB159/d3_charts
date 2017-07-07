var BarGraph = function(config){
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
}
var d,x,y,xAxis,yAxis,chart,height,width;

BarGraph.prototype.createBarGraph = function(){	
	var angle = this.angle,
		hoverLabel = this.hoverLabel,
		ratio = this.ratio,
		color = this.color,
		marginLeft = this.marginLeft,
		marginTop = this.marginTop,
		marginBottom = this.marginBottom,
		marginRight = this.marginRight,
		maintainAspect = this.maintainAspect,
		rat;
	height = this.height;
	width = this.width;
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
	x = d3.scaleBand()
				.rangeRound([0,width]).padding(0.35);
	y = d3.scaleLinear()
				.range([height,0]);
	xAxis = d3.axisBottom(x);
	yAxis = d3.axisLeft(y);
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
		x.domain(data.map(function(d){ return d.name }));
		y.domain([0,d3.max(data.map(function(d){ return d.value }))]);
		chart.append('g')
			.attr('class','x axis')
			.attr('transform','translate(0,' + height + ')')
			.call(xAxis)
		  .selectAll('.tick text')
			.call(wrap,(x.bandwidth()+8),angle,hoverLabel)
		chart.append('g')
			.attr('class','y axis')
			.call(yAxis);
		d3.select('.x').selectAll('text').attr("id",function(d,i){
			return "x"+i;
		});
		chart.selectAll('.bar')
				.data(data)
				.enter()
				.append('g')
				.attr('class','bar')
				.append('rect')
				.attr('x',function(d){ return x(d.name) })
				.attr('y',function(d){ return  y(d.value) })
				.attr("height", function(d) { return height - y(d.value); })
				.attr('width',x.bandwidth())
				.style('fill',function(d){ return color});
		if(hoverLabel === true){
			chart.selectAll('.x.axis .tick text').style("fill","none");
			chart.selectAll('.x.axis .tick line').style("stroke","none");					
			chart.selectAll('.bar')
			 .on("mouseover",function(d,i){
			 	d3.select('#x'+i).style("fill","black");
			 }).on("mouseout",function(d,i){
			 	d3.select('#x'+i).style("fill","none");
			 })
		}
	});		
}


BarGraph.prototype.updateBarGraph = function(){
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

	var bars = chart.selectAll('.bar')
					.data(data);
	d3.select('.x')
	  .call(xAxis)
	.selectAll('.tick text')
	  .call(wrap,(x.bandwidth()+8),angle,hoverLabel);

	d3.select('.y')
	  .call(yAxis);

	bars.select('rect').attr('x',function(d){ return x(d.name) })
		.attr('y',function(d){ return  y(d.value) })
		.attr("height", function(d) { return height - y(d.value) })
		.attr('width',x.bandwidth())
		.style('fill',function(d){ return color});

	var t = d3.transition()
	    .duration(750)
	    .ease(d3.easeLinear);

	bars.enter()
		.append('g')
		.attr('class','bar')
		.append('rect')
		.merge(bars)
		.attr('x',function(d){ return x(d.name) })
		.attr('y',function(d){ return  y(d.value) })
		.attr("height", function(d) { console.log(height);return height - y(d.value); })
		.attr('width',x.bandwidth())
		.style('fill',function(d){ return color });

	d3.select('.x').selectAll('text').attr("id",function(d,i){
		return "x"+i;
	});
	if(hoverLabel === true){
		chart.selectAll('.x.axis .tick text').style("fill","none");
		chart.selectAll('.x.axis .tick line').style("stroke","none");					
		chart.selectAll('.bar')
		 .on("mouseover",function(d,i){
		 	d3.select('#x'+i).style("fill","black");
		 }).on("mouseout",function(d,i){
		 	d3.select('#x'+i).style("fill","none");
		 })
	}
}


function wrap(texts, width,angle,hoverLabel) {
	if(hoverLabel)
		return;
	var vert = false;
	var temp = [];
	texts.each(function() {
		if(vert) return;
		var text = d3.select(this);
		temp.push(text.text());
		var	letters = text.text().split('').reverse(),
		    words = text.text().split(' '),
		    letter,
		    line = [],
		    lineNumber = 0,
		    lineHeight = 1.1, // ems
		    y = text.attr("y"),
		    fontSize = text.attr("font-size") || "10px",
		    dy = parseFloat(text.attr("dy")),
		    tspan = text.text(null).append("tspan").attr("font-size",fontSize).attr("x", 0).attr("y", y).attr("dy", dy + "em"),
		    count = 0;
		while (letter = letters.pop()) {
		  if(letter === " ")
		  	continue;
		  line.push(letter);
		  tspan.text(line.join(""));
		  if (tspan.node().getComputedTextLength() > width || (words[0] && words[0].length === count)) {
		  	if(tspan.node().getComputedTextLength() > width === false){
		  		count = 0;
		  		words.shift();
		  	}
		    line.pop();
		    tspan.text(line.join(""));
		    line = [letter];
		    tspan = text.append("tspan").attr("font-size",fontSize).attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(letter);
		  }
		  count++;
		}
		if(lineNumber + 1 === 4){
			vertical(texts,width,temp,angle);
			vert = true;
		}
	});
}	

function vertical(texts,width,temp,angle){
	texts.each(function(){
		var text = d3.select(this);
		if(text.select('tspan').node() !== null){
			text.selectAll('tspan').remove();
			var string = temp.shift();
			text.text(string);
		}
	})
	texts.style("text-anchor", "end")
	     .attr("dx", "-.8em")
	     .attr("dy", ".15em")
	     .attr("transform", "rotate("+ angle +")" );
}


