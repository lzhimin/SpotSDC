class BitStackChart extends standardChildView{

    constructor(svg, x, y, width, height, data){
        super(svg, x, y, width, height, data);

        this.bit = 64;

        this.categories_label = ['M', 'S', 'D'];

        this.outcome_categories = 3;

        this.col = this.bit;

        this.row = this.outcome_categories;

        this.rect_w = this.width / this.bit;

        this.rect_h = this.height;
    }

    clear(){
        if(this.g != undefined){
            this.g.remove();
            this.g = undefined;
        }
    }


    draw(){
        this.histogram2d();

        //this.init_color_scale();

        this.clear();

        if(this.g == undefined)
            this.g = this.svg.append('g');

        //background rect
        this.g
        .append('rect')
        .attr('x', this.x)
        .attr('y', this.y)
        .attr('width', this.width)
        .attr('height', this.height)
        .classed('Bit_outcome_heatmap_background_rect', true);

        for(let index = 0; index < this.hist2d.length; index++){
            let h_temp = 0;
            this.g.selectAll('.Bit_outcome_heatmap_'+this.uuid+'_rect'+index).data(this.hist2d[index]).enter()
                .append('rect')
                .attr('width', this.rect_w)
                .attr('height', (d, i)=>{
                    return this.rect_h * this.hist2d[index][i].length/d3.sum(this.hist2d[index], (d)=>{return d.length;});
                })
                .attr('x', (d, i)=>{
                    return this.x + this.rect_w * (this.hist2d.length - index - 1);
                })
                .attr('y', (d, i)=>{
                    h_temp += this.rect_h * this.hist2d[index][i].length/d3.sum(this.hist2d[index], (d)=>{return d.length;});
                    return this.y + h_temp - this.rect_h * this.hist2d[index][i].length/d3.sum(this.hist2d[index], (d)=>{return d.length;});
                })
                .style('fill', (d, i)=>{
                    switch(i){
                        case 0: return this.color['DUE'];
                        case 1: return this.color['SDC'];
                        case 2: return this.color['Masked'];
                    }
                })
                .on('click', (d, i)=>{
                    publish('SUBSETDATA', d);
                });
        }
		
		//draw dash line for sign bit, exponent bit and mantissa bit
		let dashline_d = [[this.x + this.rect_w, this.y, this.x + this.rect_w, this.y + this.height], [this.x + this.rect_w * 12, this.y, this.x + this.rect_w * 12, this.y + this.height]];
		
		this.g.selectAll('.HeatMap2d_'+this.uuid+'_dashLine_x').data(dashline_d).enter()
		.append('line')
		.attr('x1', d=>d[0])
		.attr('y1', d=>d[1])
		.attr('x2', d=>d[2])
		.attr('y2', d=>d[3])
		.style('stroke', 'black')
		.style('stroke-width', '1px')
		.style('stroke-opacity', 0.4)
        .style('stroke-dasharray', '5,5'); 
        
        this.chart_axis = d3.scaleLinear().domain([0, 1]).range([this.rect_h, 0]);
        this.chart_axis_annotation = this.g.append('g').attr('class','bitbarchart_axis')
            .attr("transform", "translate("+(this.x )+","+ this.y + ")")
            .call(d3.axisLeft(this.chart_axis).ticks(2));
    }

    setOutcomeColor(color){
        this.color  = color;
    }

    init_color_scale(){
		this.globalcolorscale = d3.scaleQuantize().domain(d3.extent(this.hist, (d)=>{return d.length;})).range(this.color);
		this.local_color_scale = new Array(this.bit);
		
		for(let i = 0; i < this.col; i++){
			this.local_color_scale[i] = this.init_local_color_scale(i);
		}
	}

	init_local_color_scale(i){
		let col = i % this.col;
		
		let data = [];
		
		for(let i = 0; i < this.row; i++){
			data.push(this.hist[i * this.col + col]);
		}
	
		let colorscale = d3.scaleQuantize().domain([0, d3.sum(data, (d)=>{return d.length;})]).range(this.color);
        
        return colorscale;
	}

	get_global_color_scale(d){
		return this.globalcolorscale(d.length);
	}

	get_local_color_scale(i, d){
		let col = i % this.col;
        
        return this.local_color_scale[col](d.length);
	}

    histogram2d(){

        let hist2d = [];

        for(let i = 0; i < this.bit; i++){
            hist2d.push([[], [], []]);
        }

        let bit = 0, outcome_menu = {'DUE':0, 'SDC': 1, 'Masked': 2};

        this.data.values.forEach(element => {
            element.values.forEach(e=>{
                bit = parseInt(e.bit) - 1;
                hist2d[bit][outcome_menu[e.outcome]].push(e);
            });
        });
        let hist = [];
        for(let j = 0; j < hist2d[0].length; j++){
            for(let i = this.bit -1; i > -1; i--){
                hist.push(hist2d[i][j]);
            }
        }
        this.hist = hist;

        this.hist2d = hist2d;
    }
}