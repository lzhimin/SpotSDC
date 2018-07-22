class ValueHeatMap extends standardChildView{

    constructor(svg, x, y, width, height, data, maxIn, minIn){
        super(svg, x, y, width, height, data);

        this.maxLogIn = maxIn;
        this.minLogIn = minIn;
        this.bin_size = 10;
        this.col = this.bin_size + 1;
        this.row = 3;

        this.width = width;
        this.heigth = height -2;

        this.rect_h = this.heigth / 3;
        this.rect_w = this.width / (this.bin_size + 1);

        this.categories_label = ['M', 'S', 'D'];

    }

    clear(){
        if(this.g != undefined){
            this.g.remove();
            this.g = undefined;
        }
    }

    draw(){
        this.hist = this.histogram2D();

        this.init_color_scale();

        this.clear();

        if(this.g == undefined)
            this.g = this.svg.append('g');

        //background rect
        this.g.append('rect')
        .attr('x', this.x)
        .attr('y', this.y)
        .attr('width', this.width)
        .attr('height', this.height)
        .classed('value_heatmap_background_rect', true);

        //heatmap rect
        this.g.selectAll('.value_heatmap_'+this.uuid+'_rect').data(this.hist).enter()
        .append('rect')
        .attr('class', 'value_heatmap_rect')
        .attr('width', this.rect_w)
        .attr('height', this.rect_h)
        .attr('x', (d, i)=>{
            return this.x + this.rect_w * (i % this.col);
        })
        .attr('y', (d, i)=>{
            return this.y + this.rect_h * (Math.floor(i / this.col));
        })
        .style('fill', (d, i)=>{
            return d == 0 ? 'white':this.get_local_color_scale(i, d);
			//return d == 0 ? 'white':this.get_global_color_scale(d);
        })
        .on('click', (d, i)=>{
            publish('SUBSETDATA', d);
        });

        // y-axis
		this.g.selectAll('.value_heatmap_'+this.uuid+'_y_label').data(this.categories_label).enter()
		.append('text')
		.text(d=>d)
		.attr('class', 'value_heatmap_label')
		.attr('x', (d, i)=>{
			return this.x - 5;
		})
		.attr('y', (d, i)=>{
			if(i == 0)
				return this.y + this.height - this.rect_h/2;
			else
				return this.y  + this.height - this.rect_h * (i + 0.5)
		})
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "central")
		.attr('font-size', 7);	   
    }

    setColor(color){
        this.color = color;
    }

    init_color_scale(){
		this.globalcolorscale = d3.scaleQuantize().domain(d3.extent(this.hist, (d)=>{return d.length;})).range(this.color);
		this.local_color_scale = new Array(this.bin_size);
		
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

    histogram2D(){

        let hist2d = [], index = 0, range = []
        for(let i = 0; i < this.bin_size; i++){
            range.push(i);
        }

        let scale = d3.scaleQuantize().domain([this.minLogIn, this.maxLogIn]).range(range);

        let outcome_menu = {'DUE':0, 'SDC': 1, 'Masked': 2};
        for(let i = 0; i <= this.bin_size; i++){
            hist2d.push([[],[],[]]);
        }

        this.data.values.forEach(element => {
            element.values.forEach(e=>{
                if(e.out_xor == 'nan'){
                    hist2d[this.bin_size][outcome_menu[e.outcome]].push(e);
                }
                else if(Math.abs(+e.out_xor) == 0){
                    hist2d[0][outcome_menu[e.outcome]].push(e);
                }
                else{
                    index = scale(Math.log(Math.abs(+e.out_xor)));
                    hist2d[index][outcome_menu[e.outcome]].push(e);
                }
            });
        });

        let hist = [];
        for(let j = 0; j < hist2d[0].length; j++){
            for(let i = 0; i <=this.bin_size; i++){
                hist.push(hist2d[i][j]);
            }
        }

        return hist;
    }
}