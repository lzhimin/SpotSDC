class ScatterPlot extends BasicView{
    
    constructor(container) {
        super(container); 

        //color blind safe
        this.outcome_color = {
            'DUE': '#542788',
            'Masked': '#1b9e77',
            'SDC': '#d95f02'
        }   
        
        this.margin = {top:50, right: 150, bottom: 50, left: 50};
        this.y = this.margin.top;
        this.x = this.margin.left;

        this.is_init = false;//whether a scatter plot is drawn

        this.outcome_color = {
            'DUE': '#542788',
            'Masked': '#1b9e77',
            'SDC': '#d95f02'
        };
    }

    init(data){
        super.init();

        this.scaterplotdata = new ScatterPlotData(data);
        this.data = this.scaterplotdata.getInputVsOutput();

        d3.select('#scatterplot').html('');
        this.chart = d3.select('#scatterplot').append('svg')
            .attr('width', this.width)
	        .attr('height', this.height)
            .append('g')
            .attr('class', 'individual_scatterplot');
            
        this.is_init = true;        

        this.drawContourPlot();
        this.draw();
    }

    setData(message, data){
        console.log(message+" in scatter plot visualization");
        this.init(data);
    }

    highlight(message, data){
        console.log(message + " in scatter plot");
        console.log(data.File_index)

        if(!this.is_init)
            return;
        
        this.chart_circle
            .attr('r', (d)=>{
                if (d.data.File_index == data.File_index)
                    return this.circle_r * 3;
                else
                    return this.circle_r;
            });
    }

    dishighlight(message, data){
        console.log(message + "  in scatter plot");
        console.log(data.File_index)

        if(!this.is_init)
            return;

        this.chart_circle
            .attr('r', (d)=>{
                return this.circle_r;
            });  
    }

    draw(){        
        this.circle_r = 5;
        this.x_axis = d3.scaleLinear().domain([0, d3.max(this.data, (d)=>{return d.x;})]).range([this.margin.left, this.width-this.margin.right]);
        this.y_axis = d3.scaleLinear().domain([0, d3.max(this.data, (d)=>{return d.y;})]).range([this.height - this.margin.top, this.margin.bottom]);

        this.chart_axis_x = this.chart.append('g').attr('class','scatterplot_axis')
            .attr("transform", "translate(0,"+ (this.height-this.margin.bottom) + ")")
            .call(d3.axisBottom(this.x_axis).ticks(10));

        this.chart_axis_y = this.chart.append('g').attr('class','scatterplot_axis')
            .attr("transform", "translate("+this.margin.left+",0)")
            .call(d3.axisLeft(this.y_axis).ticks(10));
        
        this.chart_circle = this.chart.append("g")
            .selectAll("scatter-dots")
            .data(this.data)
            .enter()
            .append("circle")
            .filter((d)=>{
                return d.outcome != 'DUE';
            })
            .attr("cx", (d)=>{ return this.x_axis(d.x);})
            .attr("cy", (d)=>{ return this.y_axis(d.y);})
            .attr("r", this.circle_r)
            .attr("fill", (d)=>{
                return this.outcome_color[d.outcome];
            })
            .attr("fill-opacity", 0.8)
            .on('click', (d, i)=>{
                fetchSingleSimulationData(d.data.File_index);
            })
            .on('mouseover', (d, i, node)=>{
                d3.select(node[i]).attr('r', this.circle_r * 3);
            })
            .on('mouseout', (d, i, node)=>{
                d3.select(node[i]).attr('r', this.circle_r);
            });
        
        this.chart.append('g').selectAll('scatterplot-data-axis-text')
            .data(['Input Error(log)', 'SDC Impact(log)'])
            .enter()
            .append('text')
            .text(d=>d)
            .attr('x', (d)=>{
                if(d === 'Input Error(log)'){
                    return this.width/2
                }else{
                    return this.margin.left;
                }
            })
            .attr('y', (d)=>{
                if(d === 'Input Error(log)'){
                    return this.height - this.margin.bottom/2;
                }else{
                    return this.margin.top/2;
                }
            })
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central');
        
        this.chart.append('g').selectAll('scatterplot_annotation')
            .data(Object.keys(this.outcome_color))
            .enter()
            .append('rect')
            .filter((d)=>{
                return d != 'DUE';
            })
            .attr('x', this.width - this.margin.right * 0.8)
            .attr('y', (d, i)=>{
                return this.margin.top + 30 * i;
            })
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', (d)=>{
                return this.outcome_color[d];
            });

        this.chart.append('g').selectAll('scatterplot_annotation')
            .data(Object.keys(this.outcome_color))
            .enter()
            .append('text')
            .filter((d)=>{
                return d != 'DUE';
            })
            .text(d=>d)
            .attr('x', this.width - this.margin.right * 0.7 + 5)
            .attr('y', (d, i)=>{
                return this.margin.top + 30 * i + 7;
            })
            .attr('dominant-baseline', 'central');
    }

    drawContourPlot(){
        this.x_axis = d3.scaleLinear().domain([0, d3.max(this.data, (d)=>{return d.x;})]).range([this.margin.left, this.width-this.margin.right]);
        this.y_axis = d3.scaleLinear().domain([0, d3.max(this.data, (d)=>{return d.y;})]).range([this.height - this.margin.top, this.margin.bottom]);

        this.chart_axis_x = this.chart.append('g').attr('class','scatterplot_axis')
            .attr("transform", "translate(0,"+ (this.height-this.margin.bottom) + ")")
            .call(d3.axisBottom(this.x_axis).ticks(10));

        this.chart_axis_y = this.chart.append('g').attr('class','scatterplot_axis')
            .attr("transform", "translate("+this.margin.left+",0)")
            .call(d3.axisLeft(this.y_axis).ticks(10));

        //compute the density data
        let densityData = d3.contourDensity().x((d)=>{
            return this.x_axis(d.x);
        }).y((d)=>{
            return this.y_axis(d.y);
        }).size([this.width - this.margin.right - this.margin.left, this.height - this.margin.top - this.margin.bottom])
        .bandwidth(20)(this.data);

        let color = d3.scaleLinear()
            .domain([0, d3.max(densityData, (d)=>{return d.value;})])
            .range(['white', '#3f007d']);

        this.chart.insert("g", "g")
            .selectAll('path')
            .data(densityData)
            .enter()
            .append('path')
            .attr('d', d3.geoPath())
            .attr('fill', (d)=>{
                return color(d.value);
            });
    }
}