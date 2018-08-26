class ErrorPropagationView extends BasicView{
    
    constructor(container){
        super(container);
        this.propagationData = new ErrorPropagationData();
        this.propagationController = new ErrorPropagationController();
    }

    init(data){
        super.init();

        this.blockw = 80;
        this.blockh = 20;

        this.y = this.top_padding = 230;
        this.x = this.left_padding = 200;
        this.padding = 20;
        this.step_size = 50;
        this.path_width = this.width - this.padding - this.blockw * 3;
        this.propagationData.setData(data);

        d3.select('#ErrorPropagationView').html('');
        this.svg = d3.select('#ErrorPropagationView').append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.variableViewBucket = {};
        ///init each variable view's and data
        this.propagationData.seqVar.forEach((d, i)=>{
            let view = new SingleVariableView(this.svg, d);

            view.setX(this.x - view.getChartWidth()/2);
            view.setY(this.y + i * (view.getRectHeight() + view.getPadding()));
            this.variableViewBucket[d] = view;
        });

        //timer 
        this.timer = new Timer(this.svg, this.propagationData.sdc_over_time.length, this.step_size);
        
        //timer step change event
        this.timer.setTimerStepChangeCallBack(this.setTimerChangeEvent.bind(this));

        this.propagationController.binding();
        this.propagationController.set_change_Relative_And_Absolute_Option_callback(this.draw.bind(this));
        this.propagationController.setTimerStepChangeCallBack(this.update.bind(this));
    }

    setData(msg, data){
        this.init(data);
        this.draw();
    }

    draw(){

        //clean svg
        this.svg.html('');

        for(let key in this.variableViewBucket){
            this.variableViewBucket[key].draw(); 
            this.variableViewBucket[key].setOnClickEventListener(this.timer.setDisplayVariable.bind(this.timer));   
        }
        
        //timer
        this.timer.setX(this.x);
        this.timer.setY(this.y - this.top_padding/2);
        this.timer.setWidth(Math.floor(this.path_width/this.step_size) * this.step_size);
  
        this.timer.setData(this.propagationData.sdc_over_time);
        this.timer.draw();
    
        //draw dynamicFlow
        this.drawExecutionLineChart(this.timer.current_time_step);
        this.drawColorScale();
    }

    setTimerChangeEvent(current){

        //for(let key in this.variableViewBucket){
        //    this.variableViewBucket[key].setTimerStep(current);
        //}
        
        this.drawExecutionLineChart(current);
        //this.timer.updateLenLocation(current);
        //this.drawBitPropagationChart(time);
        publish('SOURCECODE_HIGHLIGHT', this.propagationData.getProgramCurrentExecutedLine(current));
    }
    
    setGoldenRunData(msg, data){
        this.propagationData.setGoldenRunData(data);
    }

    update(step){

        let current_time = this.timer.getCurrentTimeStep();

        if(current_time + step > this.propagationData.sdc_over_time.length || current_time + step < 0){
            return false;
        }
        else{
            current_time = current_time + step;
            this.timer.setCurrentTimeStep(current_time);
            this.drawExecutionLineChart(this.timer.current_time_step);
            this.setTimerChangeEvent(this.timer.current_time_step);
            return true;
        }
    }
   
    drawColorScale(){
        let width = 50;
        let colorScale = d3.scaleSequential(d3.interpolateOrRd).domain([0, width]);

        if(this.colorscalesvg != undefined)
            this.colorscalesvg.remove();

        this.colorscalesvg = this.svg.append('g');

        this.colorscalesvg.selectAll('.errorColorScaleBar').data(d3.range(width), (d)=>{return d;})
        .enter()
        .append('rect')
        .attr('x', (d, i)=>{return i * 3 + this.x + 400;})
        .attr('y', 20)
        .attr('height', 15)
        .attr('width', 3)
        .style('fill', (d, i)=>{return colorScale(d);})

        this.colorscalesvg.selectAll('.errorColorScaleBar').data(['0', this.sdc_max.toFixed(2)])
        .enter()
        .append('text')
        .attr('x', (d, i)=>{
            return i == 0? this.x + 400 : this.x + 400 + width * 3;})
        .attr('y', 15)
        .text(d=>d)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central'); 
    }

    drawExecutionLineChart(current){

        this.sdc_max = - Number.MAX_VALUE;
        for(let i  = 0; i < this.propagationData.sdc_over_time.length; i++){
            this.sdc_max = Math.max(this.propagationData.sdc_over_time[i][1], this.sdc_max);
        }

        let temp_colorscale = d3.scaleLinear().domain([0, this.sdc_max]).range([0,1]);
        let step_w = Math.floor(this.path_width/this.step_size);
        let data_item = [];

        if(this.excutionLineChart_g != undefined)
            this.excutionLineChart_g.remove();
        this.excutionLineChart_g = this.svg.append('g');

        for(let i = current; i < this.propagationData.sdc_over_time.length && i < current + this.timer.len_width; i++){
            data_item.push(this.propagationData.sdc_over_time[i]);
        }

        this.excutionLineChart_g.selectAll('.DynamicFlowPath_rect')
        .data(data_item)
        .enter()
        .append('rect')
        .attr('x', (d, i)=>{
            return i * step_w + this.x;
        })
        .attr('y', (d)=>{
            return this.variableViewBucket[d[0]].getY();
        })
        .attr('width', step_w)
        .attr('height', Math.min(step_w, this.blockh))
        .attr('fill', (d)=>{
            return d[0] != 0 ? d3.interpolateOrRd(temp_colorscale(d[1])):'white';
        })
        .attr('fill-opacity', (d)=>{
            return d[0]!=0 ? 1 : 0;
        })
        .style('stroke', 'gray')
        .style('stroke-opacity', 0.5)
        .style('stroke-width', '1px');

        
        //for(let i = x1; i < current && i < this.propagationData.relativeError.length; i++){  
        //    if(i < 0)
        //        continue
        //    else
        //        left_items.push([this.propagationData.relativeError[i], i]);
        //}

        //for(let i = current; i < x2 && i < this.propagationData.relativeError.length; i++){
        //    right_items.push([this.propagationData.relativeError[i], i]);
        //}

        

        //left rect
        /*this.excutionLineChart_g.selectAll('.DynamicFlowPath_Leftrect').data(left_items).enter()
            .append('rect')
            .attr('x', (d)=>{
                return this.timer.left_time_axis(d[1]);
            })
            .attr('y', (d)=>{
                return this.variableViewBucket[d[0][0]].getY() + 3;
            })
            .attr('width', step_w)
            .attr('height', Math.min(step_w, this.blockh))
            .attr('fill', (d)=>{
                return d[0][1] != 1 ? d3.interpolateOrRd(temp_colorscale(d[0][1])):'white';
                //return d[0][1]!=0?d3.interpolateOrRd(d[0][1]):'white';
            })
            .attr('fill-opacity', (d)=>{
                return d[0][1]!=0?1:0;
            })
            .style('stroke', 'gray')
            .style('stroke-opacity', 0.5)
            .style('stroke-width', '1px');*/
        
        //rigth rect
        /*this.excutionLineChart_g.selectAll('.DynamicFlowPath_rightrect').data(right_items).enter()
            .append('rect')
            .attr('x', (d)=>{
                return this.timer.right_time_axis(d[1]);
            })
            .attr('y', (d)=>{
                return this.variableViewBucket[d[0][0]].getY() + 3;
            })
            .attr('width', step_w)
            .attr('height', Math.min(step_w, this.blockh))
            .attr('fill', (d)=>{
                return d[0][1] != 1 ? d3.interpolateOrRd(temp_colorscale(d[0][1])):'white';
                //return d[0][1] != 0 ? d3.interpolateOrRd(d[0][1]):'white';
            })
            .attr('fill-opacity', (d)=>{
                return d[0][1] != 0 ? 1:0;
            })
            .style('stroke', 'gray')
            .style('stroke-opacity', 0.5)
            .style('stroke-width', '1px');*/
    }
}