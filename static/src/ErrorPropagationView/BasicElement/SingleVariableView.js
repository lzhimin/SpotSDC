class SingleVariableView{

    constructor(svg, name){
        this.svg = svg;

        this.blockw = 80;
        this.blockh = 20;

        this.width = 500;
        this.padding = 10;

        this.name = name;

        this.error_option = 'relative';

        //this.time_intervel = 50;

        this.timer = 0;

        this.uuid = uuidv4();

        this.onclickeventlistener = undefined;
    }

    extractDataByType(data, type){
        
        let l = Math.min(data.error.length, data.golden.length);
        let e = 0;
        let g = 0;

        let values = []

        for(let i = 0; i < l; i++){

            if(i < data.golden.length){
                g = data.golden[i][1];
            }else{
                g = data.golden[data.golden.length - 1][1];
            }

            if(i < data.error.length){
                e = data.error[i][1];
            }else{
                e = data.error[data.error.length - 1][1];
            }

            if(type == 'absolute'){
                e - g != 0 ? values.push(Math.abs(e - g)): values.push(0);
            }
            else if(type == 'relative'){
                if(e == 0 && g == 0)
                    values.push(0);
                else{
                    e - g == 0 ? values.push(0) : values.push(Math.abs(e - g)/d3.max(this.absoluteData));
                }
            }
        }
        return values;
    }

    setX(x){
        this.x = x;
    }

    setY(y){
        this.y = y;
    }

    setData(data){
        this.golden = data.golden;
        this.error = data.error;
        this.absoluteData = this.extractDataByType(data, 'absolute');
        this.relativeData = this.extractDataByType(data, 'relative');
    }

    setTimerStep(timer){

        if(timer >= this.relativeData.length)
            return;

        this.rects.style('fill', (d, i)=>{
            return this.relativeData[timer] == 0? 'white':d3.interpolateReds(this.relativeData[timer]);
        });

        this.highLightRect.style('display', ()=>{
            return this.error[timer][0] == this.name? 'block' : 'none';
        });

        this.timer = timer;

        this.draw_error_heatmap(this.relativeData);
    }

    setErrorOption(option){
        this.error_option = option;
    }

    setOnClickEventListener(func){
        this.onclickeventlistener = func;
    }

    getDownConnectionLocation(){

        return [this.x + this.blockw * 1.5, this.y + this.blockh/2];
    }

    getUpConnectionLocation(){
        return [this.x, this.y + this.blockh/2];
    }

    getX(){
        return this.x;
    }

    getY(){
        return this.y;
    }

    getRectWidth(){
        return this.blockw;
    }

    getRectHeight(){
        return this.blockh;
    }

    getPadding(){
        return this.padding;
    }

    getChartWidth(){
        return this.blockw*1.5;
    }

    getLineChartStartX(){
        return this.x + this.blockw * 1.5 + this.padding;
    }

    getMaxTimeStep(){
        return this.relativeData.length;
    }

    draw(){

        this.highLightRect = this.svg.datum(['highlight']).append('rect')
        .attr('x', this.x - 25)
        .attr('y', this.y + this.blockh/2 - 5)
        .attr('width', 20)
        .attr('height', 10)
        .style('display', 'none')
        .style('fill', '#2c7fb8');

        this.rects = this.svg.selectAll('.singleVariableRect'+'_'+this.uuid)
        .data(this.name.split(':'))
        .enter()
        .append('rect')
        .attr('x', (d, i)=>{
            return this.x + this.blockw/2 * i;
        })
        .attr('y', this.y)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('width', (d, i)=>{
            return i == 0? this.blockw/2:this.blockw;
        })
        .attr('height', this.blockh)
        .on('click', (d, i, nodes)=>{
            this.onclickeventlistener(this.name);
            d3.selectAll(nodes).classed("singleVariableRect_clicked", !d3.select(nodes[0]).classed("singleVariableRect_clicked"));

        })
        .classed('singleVariableRect', true);

        this.texts = this.svg.selectAll('.singleVariableText'+'_'+this.uuid)
        .data(this.name.split(':'))
        .enter()
        .append('text')
        .text(d=>d)
        .attr('x', (d, i)=>{
            return this.x + (i == 0? this.blockw/4: this.blockw);
        })
        .attr('y', this.y + this.blockh/2)
        .classed('singleVariableText', true)
        .attr('text-anchor', 'middle')
        .attr('domain-baseline', 'central');

        this.draw_error_heatmap(this.relativeData);
        //draw line chart
        //if(this.error_option == 'relative')
        //   this.draw_error_line_chart(this.relativeData);
        //else
        //   this.draw_error_line_chart(this.absoluteData);
    }

    draw_error_line_chart(data){
    
        let x_axis = d3.scaleLinear()
                        .range([this.x + this.padding * 10 + this.blockw, this.x + this.padding + this.width + this.blockw])
                        .domain([0, data.length]);
        let y_axis = d3.scaleLinear()
                        .domain([0, d3.max(data)])
                        .range([this.y + this.blockh - 10, this.y])
                        
        let line = d3.line()
                        .x((d, i)=>{
                            return x_axis(i);
                        })
                        .y((d, i)=>{
                            return y_axis(d);
                        });
        
        this.svg.append('g').attr('class','axis axis--x')
            .attr("transform", "translate(0,"+(this.y + this.blockh - 5) + ")")
            .call(d3.axisBottom(x_axis).ticks(10));
        
        this.svg.append("g")
            .attr("class", "axis axis--y")
            .attr("transform", "translate("+(this.x+ this.blockw + this.padding + this.width)+",5)")
            .call(d3.axisRight(y_axis).ticks(2));
        
        this.svg.selectAll('.cleanErrorline').data([data])
            .enter()
            .append('g')
            .append('path')
            .attr('class', 'line')
            .attr('d', function(d, i){
                return line(d);
            })
            .attr("fill", "none")
            .style('stroke', function(d, i){
                return '#d95f0e';
            }); 
    }

    draw_error_heatmap(data){
        
        if(this.heatmapsvg ==  undefined)
            this.heatmapsvg = this.svg.append('g');
        this.heatmapsvg.html('');

        this.heatmapsvg.selectAll('.errorHeatmap').data(()=>{
            if(this.timer + this.time_intervel > data.length)
                return data.slice(this.timer, this.timer + data.length - this.timer);
            else
                return data.slice(this.timer, this.timer + this.time_intervel);
        })
        .enter()
        .append('rect')
        .attr('x', (d, i)=>{
            return this.x + this.blockw * 1.6 + i * 10;
        })
        .attr('y', (d)=>{
            return this.y + this.blockh/2-5;
        })
        .attr('width', (d, i)=>{
            return this.blockw;
        })
        .attr('height', 10)
        .style('fill', (d)=>{
            return d != 0?d3.interpolateOrRd(d):'white';
        });
    }
}