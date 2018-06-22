class ErrorPropagationView extends BasicView{
    
    constructor(container){
        super(container);
        this.propagationData = new ErrorPropagationData();
    }

    init(data){
        super.init();

        this.blockw = 80;
        this.blockh = 30;
        this.path_width = 400;

        this.y = this.top_padding = 150;
        this.x = this.left_padding = 100;
        this.padding = 20;
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
            view.setX(this.x);
            view.setY(this.y + i * (view.getRectHeight() + view.getPadding()));
            this.variableViewBucket[d] = view;
        });

        //timer 
        this.timer = new Timer(this.svg, this.variableViewBucket[this.propagationData.seqVar[0]].getMaxTimeStep());
            //timer step change event
        this.timer.setTimerStepChangeCallBack(this.setTimerChangeEvent.bind(this));

        //controller 
        this.propagationController = new ErrorPropagationController();
        this.propagationController.set_change_Relative_And_Absolute_Option_callback(this.draw.bind(this));
        this.propagationController.setTimerStepChangeCallBack(this.update.bind(this));
    }

    setTimerChangeEvent(time){

        for(let key in this.variableViewBucket){
            this.variableViewBucket[key].setTimerStep(time);
        }
        this.drawExecutionLineChart(time);

        publish('SOURCECODE_HIGHLIGHT', this.propagationData.getProgramCurrentExecutedLine(time));
    }

    setData(msg, data){
        this.init(data);
        this.draw();
    }

    setGoldenRunData(msg, data){
        this.propagationData.setGoldenRunData(data);
    }

    draw(){

        //clean svg
        this.svg.html('');

        for(let key in this.variableViewBucket){
            this.variableViewBucket[key].setErrorOption(this.propagationController.getOption());
            this.variableViewBucket[key].draw();
        }

        //timer
        this.timer.setX(this.x + this.variableViewBucket[this.propagationData.seqVar[0]].getLineChartStartX());
        this.timer.setY(this.y - this.top_padding/2);
        this.timer.setRelativeData(this.propagationData.relativeError);
        this.timer.draw();
    
        //draw dynamicFlow
        //this.drawDynamicFlow();
        this.drawExecutionLineChart(0);


        //if the propagation view is large than the computer screen view,
        //reset the height of svg 
        let currentheight = this.y + (this.variableViewBucket[this.propagationData.seqVar[0]].getRectHeight() + this.variableViewBucket[this.propagationData.seqVar[0]].getPadding()) * this.propagationData.seqVar.length;
        if(currentheight > this.height){
            this.svg.attr('height', currentheight + this.variableViewBucket[this.propagationData.seqVar[0]].getPadding() * 2)
            .attr('width', 10000);
        }

    }

    update(step){

        let current_time = this.timer.getCurrentTimeStep();

        if(current_time + step > this.propagationData.goldenRun.length || current_time + step < 0){
            return false;
        }else{
            current_time = current_time + step;
            this.drawExecutionLineChart(current_time);
            this.timer.setCurrentTimeStep(current_time);
            this.setTimerChangeEvent(current_time);
            return true;
        }
    }

    drawExecutionLineChart(current_time){

        let step_size = 10;
        let line = d3.line().x((d, i)=>{return d[0];}).y((d, i)=>{return d[1];}).curve(d3.curveStepAfter);
        let path = [];
        let items = [];
        let item = undefined;

        for(let i = 0; i < 100 && (current_time + i) < this.propagationData.relativeError.length; i++){
            
            item = this.propagationData.relativeError[current_time+i]; 
            path.push([this.x + this.blockw * 1.6 + i * step_size, this.variableViewBucket[item[0]].getY() + this.blockh/2 - step_size/2]);
            items.push(item);
        }

        if(this.excutionLineChart_g != undefined)
            this.excutionLineChart_g.remove();
        this.excutionLineChart_g = this.svg.append('g');
        
        this.excutionLineChart_g.selectAll('.DynamicFlowPath').data([path]).enter()
            .append('path')
            .classed('line', true)
            .classed('errorPropagation_DynamicFlowPath', true)
            .attr('d', function(d, i){
                return line(d);
            })
            .attr("fill", "none");

        this.excutionLineChart_g.selectAll('.DynamicFlowPath_rect').data(items).enter()
            .append('rect')
            .attr('x', (d, i)=>{return this.x + this.blockw * 1.6 + i * step_size})
            .attr('y', (d, i)=>{return this.variableViewBucket[d[0]].getY() + step_size/2})
            .attr('width', step_size)
            .attr('height', step_size)
            .attr('fill', (d, i)=>{
                return d[1]!=0?d3.interpolateOrRd(d[1]):'white';
            })
            .attr('fill-opacity', (d, i)=>{
                return d[1]!=0?1:0;
            });
    }

    /*drawExecutionLineChart(){

        let step_size = 10;
        
        let line = d3.line().x((d, i)=>{return d[0];}).y((d, i)=>{return d[1];}).curve(d3.curveStepAfter);

        let path = [];

        this.propagationData.data.forEach((d, i)=>{
            if(i >= this.timer.current_time_step  && i <= this.timer.current_time_step + this.variableViewBucket[d.line+':'+d.var].time_intervel)
                path.push([this.x + this.blockw * 1.6 + (i - this.timer.current_time_step) * step_size, this.variableViewBucket[d.line+':'+d.var].getY() + this.blockh/2 - 5]);
        });


        if(this.excutionLineChart_g != undefined)
            this.excutionLineChart_g.remove();
        this.excutionLineChart_g = this.svg.append('g');
        
        this.excutionLineChart_g.selectAll('.DynamicFlowPath').data([path]).enter()
            .append('path')
            .classed('line', true)
            .classed('errorPropagation_DynamicFlowPath', true)
            .attr('d', function(d, i){
                return line(d);
            })
            .attr("fill", "none");
    }*/

}