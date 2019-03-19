class SmartValueBarChart extends standardChildView{

    constructor(svg, x, y, width, height, data, lowestProblemBit){
        super(svg, x, y, width, height, data);

        this.lowestProblemBit = lowestProblemBit

        this.bit = 64;//- lowestProblemBit + 1;

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
        this.init_scale();

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
                    let h = this.globalscale(this.hist2d[index][i].length);
                    return h;
                })
                .attr('x', (d, i)=>{
                    return this.x + this.rect_w * (this.hist2d.length - index - 1);
                })
                .attr('y', (d, i)=>{
                    let h = this.globalscale(this.hist2d[index][i].length);
                    h_temp += h;
                    return this.y + this.rect_h - h_temp;
                })
                .style('fill', (d, i)=>{
                    switch(i){
                        case 0: return this.color['Masked'];
                        case 1: return this.color['SDC'];
                        case 2: return this.color['DUE'];
                    }
                })
                .on('click', (d, i)=>{
                    publish('SUBSETDATA', d);
                });
        }

        //heatmap rect
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
        
        this.chart_axis = d3.scaleLinear().domain([0, this.max_number_of_sample]).range([this.rect_h, 0]);
        this.chart_axis_annotation = this.g.append('g').attr('class','bitbarchart_axis')
            .attr("transform", "translate("+(this.x )+","+ this.y + ")")
            .call(d3.axisLeft(this.chart_axis).ticks(2));
        
        //draw sampling operation.
        this.g.append('g').selectAll('path')
        .data(['symbolCross'])
        .enter()
        .append('path')
        .attr('transform', (d, i)=>{
            return 'translate(' + (this.x + this.width + 10) + ','+ (this.y + this.height/2) +')';
        })
        .attr('d', (d)=>{
            return d3.symbol().size(100).type(d3[d])();
        })
        .style('fill', 'gray')
        .on('click', (d)=>{
            this.info = this.getDataLocation();
            this.resample = [];
        
            let callback = function(data){
                this.sample = data.filter((d)=>{
                    return d.Function == this.info.function && 
                        d.Variable == this.info.variable &&
                        d.Line == this.info.line;
                });

                //random sample 10%
                let resample_set = [];

                for(let i = 0; i < 20; i++){
                    let index = parseInt(Math.random() * this.sample.length);
                    resample_set.push(this.sample[index])
                }

                this.sample = resample_set;

                this.InsertResampleData(this.sample);

                publish('RESAMPLE', this.sample)
            }
            //get the name of current data set
            let dataname = $("#program_TreeView_file_selector").val();

            if(dataname.split("_")[0] == "cg")
                d3.csv('../static/data/cg_complete.csv').then(callback.bind(this));
            else if(dataname.split("_")[0] == "fft")
                d3.csv('../static/data/fft_exhaust.csv').then(callback.bind(this));
        });  
    }

    getDataLocation(){
        let item = this.data.values[0].values[0];
        return {'function':item.Function, 'line':item.Line, 'variable':item.Variable};
    }
    
    InsertResampleData(data){
        let sample = {'key':'resample','values':[]};

        for(let i = 0; i < data.length; i++){
            sample.values = data;
        }

        this.data.values.push(sample);
        this.draw();
    }

    setOutcomeColor(color){
        this.color  = color;
    }

    init_scale(){
        this.max_number_of_sample = d3.max(this.hist, (d)=>{return d.length;});
		this.globalscale = d3.scaleLinear().domain([0, this.max_number_of_sample]).range([0, this.rect_h]);
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

        let bit = 0, outcome_menu = {'DUE':2, 'SDC': 1, 'Masked': 0};

        this.data.values.forEach(element => {
            element.values.forEach(e=>{
                bit = parseInt(e.bit) - 1;
                hist2d[bit][outcome_menu[e.outcome]].push(e);
            });
        });

        let hist = [];
        //for(let j = 0; j < hist2d[0].length; j++){
        for(let i = this.bit - 1; i > -1; i--){
            hist.push(hist2d[i][0].concat(hist2d[i][1]).concat(hist2d[i][2]));
        }
        //}

        this.hist = hist;
        this.hist2d = hist2d;
    }
}