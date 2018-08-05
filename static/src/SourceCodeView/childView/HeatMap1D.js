class HeatMap1D{
	
	//data: contain label and bins
	constructor(svg, x, y, width, height, data){
		
        this.svg = svg;
        this.svg_g = this.svg.append('g');
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.data = data;

		//each plot should have a unique id
		this.uuid = uuidv4();
		
		//color scale for heatmap
		this.colorscale = d3.interpolateOrRd; 
	}
	
	
	clear(){
        this.svg_g.remove();
        this.svg_g = this.svg.append('g');
	}
	
	draw(){
		this.clear();
		
		//heatmap
		this.svg_g.selectAll('.heatmap1d' + this.uuid + '_rect').data(this.data).enter()
		.append('rect')
		.attr('x', (d, i)=>{
			return this.x + i * this.width/this.data.length;
		})
		.attr('y', (d, i)=>{
			return this.y;
		})
		.attr('width', this.width/this.data.length)
		.attr('height', this.height)
		.style('fill', (d,i)=>{
			//return d3.interpolateReds(d);
			if(d == -1)
				return 'rgba(121, 127, 137,'+ 0.5+')';
			else if(d==0)
				return 'white';
			else 
				return  this.colorscale(d); 
		})
		.style('stroke', 'gray')
		.style('stroke-width', '1px');
		
		//label
		this.svg_g.selectAll('.heatmap' + this.uuid + '_label').data(this.data).enter()
		.append('text')
		.text((d,i)=>{
			return i;
		})
		.attr('x', (d,i)=>{
			return this.x + (i + 0.5) * this.width/this.data.length;
		})
		.attr('y', (d,i)=>{
			return this.y + this.height/2;
		})
		.attr("text-anchor", "middle")
        	.attr("dominant-baseline", "central")
		.style('fill', 'gray')
		.style('font-size', '12px');
	}
}