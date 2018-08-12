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
        this.x = this.left_padding = 100;
        this.padding = 20;
        this.step_size = 50;
        this.path_width = this.width - this.padding - this.blockw * 1.5;
        this.propagationData.setData(data);

        d3.select('#ErrorPropagationView').html('');
        this.svg = d3.select('#ErrorPropagationView').append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.variableViewBucket = {};
        ///init each variable view's and data
        this.propagationData.seqVar.forEach((d, i)=>{
            let view = new SingleVariableView(this.svg, d);

            view.setData(this.propagationData.getGolden_Error_SequenceValue(d));
            view.setX(this.x + this.path_width/2 - view.getChartWidth()/2);
            view.setY(this.y + i * (view.getRectHeight() + view.getPadding()));
            this.variableViewBucket[d] = view;
        });

        //timer 
        this.timer = new Timer(this.svg, this.variableViewBucket[this.propagationData.seqVar[0]].getMaxTimeStep());
            //timer step change event
        this.timer.setTimerStepChangeCallBack(this.setTimerChangeEvent.bind(this));

        //controller 
        this.propagationController.binding();
        this.propagationController.set_change_Relative_And_Absolute_Option_callback(this.draw.bind(this));
        this.propagationController.setTimerStepChangeCallBack(this.update.bind(this));
    }

    draw(){

        //clean svg
        this.svg.html('');

        for(let key in this.variableViewBucket){
            this.variableViewBucket[key].setErrorOption(this.propagationController.getOption());
            this.variableViewBucket[key].draw();
            this.variableViewBucket[key].setOnClickEventListener(this.timer.setDisplayVariable.bind(this.timer));
        }
        
        //timer
        this.timer.setX(this.x);
        this.timer.setY(this.y - this.top_padding/2);
        this.timer.setWidth(Math.floor(this.path_width/this.step_size) * this.step_size);
        this.timer.setLengap(this.blockw * 1.5);
        this.timer.setRelativeData(this.propagationData.relativeError);
        this.timer.draw();
    
        //draw dynamicFlow
        this.drawExecutionLineChart(this.timer.len_x1, this.timer.len_x2, this.timer.current_time);
        this.drawColorScale();
        
        //if the propagation view is large than the computer screen view,
        //reset the height of svg 
        let currentheight = this.y + (this.variableViewBucket[this.propagationData.seqVar[0]].getRectHeight() + this.variableViewBucket[this.propagationData.seqVar[0]].getPadding()) * this.propagationData.seqVar.length;
        if(currentheight > this.height){
            this.svg.attr('height', currentheight + this.variableViewBucket[this.propagationData.seqVar[0]].getPadding() * 2);
        }
    }

    setTimerChangeEvent(x1, x2, current){

        for(let key in this.variableViewBucket){
            this.variableViewBucket[key].setTimerStep(current);
        }
        
        this.drawExecutionLineChart(x1, x2, current);
        //this.drawBitPropagationChart(time);
        publish('SOURCECODE_HIGHLIGHT', this.propagationData.getProgramCurrentExecutedLine(current));
    }

    setData(msg, data){
        this.init(data);
        this.draw();
    }

    setGoldenRunData(msg, data){
        this.propagationData.setGoldenRunData(data);
    }

    update(step){

        let current_time = this.timer.getCurrentTimeStep();

        if(current_time + step > this.propagationData.goldenRun.length || current_time + step < 0){
            return false;
        }
        else{
            current_time = current_time + step;
            this.timer.setCurrentTimeStep(current_time);
            this.drawExecutionLineChart(this.timer.len_x1, this.timer.len_x2, this.timer.current_time_step);
            this.setTimerChangeEvent(this.timer.len_x1, this.timer.len_x2, this.timer.current_time_step);
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
        .attr('x', (d, i)=>{return i * 3+this.x + 400;})
        .attr('y', 20)
        .attr('height', 15)
        .attr('width', 3)
        .style('fill', (d, i)=>{return colorScale(d);})

        this.colorscalesvg.selectAll('.errorColorScaleBar').data(['0', '1'])
        .enter()
        .append('text')
        .attr('x', (d, i)=>{
            return i == 0? this.x + 400 : this.x + 400 + width * 3;})
        .attr('y', 15)
        .text(d=>d)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central'); 
    }

    drawExecutionLineChart(x1, x2, current){

        let step_w = Math.floor(this.path_width/this.step_size);
        let left_items = [];
        let right_items = [];

        for(let i = x1; i < current && i < this.propagationData.relativeError.length; i++){  
            if(i < 0)
                continue
            else
                left_items.push([this.propagationData.relativeError[i], i]);
        }

        for(let i = current; i < x2 && i < this.propagationData.relativeError.length; i++){
            right_items.push([this.propagationData.relativeError[i], i]);
        }

        if(this.excutionLineChart_g != undefined)
            this.excutionLineChart_g.remove();
        this.excutionLineChart_g = this.svg.append('g');

        //left rect
        this.excutionLineChart_g.selectAll('.DynamicFlowPath_Leftrect').data(left_items).enter()
            .append('rect')
            .attr('x', (d)=>{return this.timer.selected_time_axis(d[1]);})
            .attr('y', (d)=>{return this.variableViewBucket[d[0][0]].getY() + 3})
            .attr('width', step_w)
            .attr('height', Math.min(step_w, this.blockh))
            .attr('fill', (d)=>{
                return d[0][1]!=0?d3.interpolateOrRd(d[0][1]):'white';
            })
            .attr('fill-opacity', (d)=>{
                return d[0][1]!=0?1:0;
            })
            .style('stroke', 'gray')
            .style('stroke-opacity', 0.5)
            .style('stroke-width', '1px');
        
        //rigth rect
        this.excutionLineChart_g.selectAll('.DynamicFlowPath_rightrect').data(right_items).enter()
            .append('rect')
            .attr('x', (d)=>{return this.timer.selected_time_axis(d[1])})
            .attr('y', (d)=>{return this.variableViewBucket[d[0][0]].getY() + 3})
            .attr('width', step_w)
            .attr('height', Math.min(step_w, this.blockh))
            .attr('fill', (d)=>{
                return d[0][1] != 0 ? d3.interpolateOrRd(d[0][1]):'white';
            })
            .attr('fill-opacity', (d)=>{
                return d[0][1] != 0 ? 1:0;
            })
            .style('stroke', 'gray')
            .style('stroke-opacity', 0.5)
            .style('stroke-width', '1px');
    }
}