class ErrorPropagationView extends BasicView{
    
    constructor(container){
        super(container);
        this.propagationData = new ErrorPropagationData();
        this.propagationController = new ErrorPropagationController();
    }

    init(data){
        super.init();

        this.blockw = 80;
        this.blockh = 30;

        this.y = this.top_padding = 230;
        this.x = this.left_padding = 100;
        this.padding = 20;
        this.step_size = 30;
        this.path_width = this.width - this.padding - this.blockw * 4.5;
        this.propagationData.setErrorRunData(data);

        d3.select('#ErrorPropagationView').html('');
        this.svg = d3.select('#ErrorPropagationView').append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.lineLocation = {};

        this.variableViewBucket = {};

        ///init each variable view's and data
        this.propagationData.seqVar.forEach((d, i)=>{
            let view = new SingleVariableView(this.svg, d);

            view.setData(this.propagationData.getGolden_Error_SequenceValue(d), this.propagationData.impactfactor);
            view.setX(this.x + this.path_width/2 - view.getChartWidth()/2.5);
            view.setY(this.y + i * (view.getRectHeight() + view.getPadding()));
            view.setMaxRelativeError(this.propagationData.getMaxAbsoluteError());
            this.variableViewBucket[d] = view;
        });

        //timer 
        this.timer = new Timer(this.svg, this.variableViewBucket[this.propagationData.seqVar[0]].getMaxTimeStep());
        
        //timer step change event
        this.timer.setTimerStepChangeCallBack(this.setTimerChangeEvent.bind(this));

        this.timer.setImpactFactor(this.propagationData.impactfactor);

        //controller 
        this.propagationController.binding();
        this.propagationController.set_change_Relative_And_Absolute_Option_callback(this.draw.bind(this));
        this.propagationController.setTimerStepChangeCallBack(this.update.bind(this));
    }

    draw(){

        //clean svg
        this.svg.html('');
        //if($('input[name=propagatation_error_radio]:checked').val() == "propagation_dynamic")
            this.draw_dynamic();
        //else
        //    this.draw_static();
        
    }

    draw_dynamic(){
        d3.select("#ErrorPropagationView_button_control").style("display", "block");
        this.blockw = 80;
        this.blockh = 30;

        //timer
        this.timer.setX(this.padding + this.blockw * 4);
        this.timer.setY(this.y - this.top_padding/2);
        //this.timer.setLengap(this.blockw);
        this.timer.setWidth(Math.floor(this.path_width/this.step_size) * this.step_size);
        this.timer.setRelativeData(this.propagationData.relativeError);
        this.timer.setAbsoluteError(this.propagationData.absoluteError);
        this.timer.setGlobalVariable(this.propagationData.global_variable);
        this.timer.draw();

        //if the propagation view is large than the computer screen view,
        //reset the height of svg 
        let currentheight = this.y + (this.variableViewBucket[this.propagationData.seqVar[0]].getRectHeight() + this.variableViewBucket[this.propagationData.seqVar[0]].getPadding()) * this.propagationData.seqVar.length;
        if(currentheight > this.height){
            this.svg.attr('height', currentheight + this.variableViewBucket[this.propagationData.seqVar[0]].getPadding() * 2);
        }

        this.draw_tree();

        //draw dynamicFlow
        this.drawExecutionLineChart();
        this.drawColorScale();

        //draw absolute error distribution histogram
        this.draw_absolute_value_histogram();
    }

    draw_static(){
        d3.select("#ErrorPropagationView_button_control").style("display", "none");
        this.blockw = 60;
        this.blockh = 50;

          //if the propagation view is large than the computer screen view,
        //reset the height of svg 
        let currentheight = this.y + (this.variableViewBucket[this.propagationData.seqVar[0]].getRectHeight() + this.variableViewBucket[this.propagationData.seqVar[0]].getPadding()) * this.propagationData.seqVar.length;
        if(currentheight > this.height){
            this.svg.attr('height', currentheight + this.variableViewBucket[this.propagationData.seqVar[0]].getPadding() * 2);
        }

        this.draw_tree(20, 100);
    }

    draw_absolute_value_histogram(){
        
        let error_distribution = [];

        //Get absolute error distribution
        this.propagationData.absoluteError.forEach((d)=>{
            error_distribution.push(d[1]);
        });

        this.x_scale = d3.scaleLinear().domain(d3.extent(error_distribution)).range([50, 250]);
        let bins = d3.histogram().domain(this.x_scale.domain()).thresholds(this.x_scale.ticks(10))(error_distribution);
        let y_scale = d3.scaleLinear().domain(d3.extent(bins, (d)=>{
            return d.length;
        })).range([100, 0]);

        let histogram = this.svg.append('g');
        let bar = histogram.selectAll('.bar').data(bins).enter().append('g')
            .attr('class', 'bar')
            .attr('transform', (d)=>{
                return 'translate('+ this.x_scale(d.x0)+','+(y_scale(d.length)+50)+')';
            });
        
        bar.append('rect')
            .attr('x', 1)
            .attr('width', this.x_scale(bins[0].x1) - this.x_scale(bins[0].x0) - 1)
            .attr('height', (d)=>{return 100 - y_scale(d.length);})
            .style('fill', 'steelblue');
        
        histogram.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + 150 + ')')
            .call(d3.axisBottom(this.x_scale).ticks(5));

        histogram.append('g')
            .attr('class', 'axis axis--y')
            .attr('transform', 'translate(50,50)')
            .call(d3.axisLeft(y_scale).ticks(5));
        
        histogram.append('g')
            .append('text')
            .text('Error(log) Density Distribution Histogram')
            .attr('class', 'histogram_anotation') 
            .attr('transform', 'translate(35, 200)');

        histogram.append('g')
            .append('text')
            .text('Frequency')
            .attr('class', 'histogram_anotation') 
            .attr('transform', 'translate(35, 40)');

        var brush = d3.brushX().extent([[50, 50], [250, 150]])
        .on('start brush end',  brushevent.bind(this));

        function brushevent(){
            let x1, x2;
            if(d3.event.selection == null){
                x1 = this.x_scale.invert(50);
                x2 = this.x_scale.invert(250);
            }else{
                x1 = this.x_scale.invert(d3.event.selection[0]);
                x2 = this.x_scale.invert(d3.event.selection[1]); 
            }
            this.brushFileterCallback(x1, x2);
        }
        
        histogram.append('g').attr('class', 'brush')
        .call(brush);

        return 0;
    }

    brushFileterCallback(x1, x2){
        this.propagationData.setFilterAbsoluteError(x1, x2);
        this.timer.setAbsoluteError(this.propagationData.filteredAbsolutedError);
        this.timer.redraw();
    }

    draw_tree(x=20, y=230){

        let hierachicaldata = this.propagationData.hierachicalData;
        let h = 0;
        let padding = 3;

        hierachicaldata.values.sort(function(a, b){
            return a.key > b.key;
        });

        if(this.the_node_is_not_a_leaf(hierachicaldata)){
            hierachicaldata.values.forEach((d, index)=>{
                h += this.draw_inner_node(x + this.blockw, y + h, d, hierachicaldata.key);
                h += padding;
            });
        }

        //if the current svg is smaller than the current size of tree
        if(this.height < this.top_padding + h + this.bottom_padding){
            this.svg.attr('height', this.top_padding + h + this.bottom_padding);
        }
        this.draw_node(x, y, h - padding, this.blockw, hierachicaldata);
    }

    draw_inner_node(x, y, data, parent){

        let height_of_current_node = 0;
        //fix the order
        data.values.sort(function(a, b){
            return a.key > b.key;
        });

        if(this.the_node_is_not_a_leaf(data)){
            //recursive draw the tree node
            data.values.forEach((d, index)=>{
                height_of_current_node += this.draw_inner_node(x + this.blockw, y + height_of_current_node, d, parent+'_'+data.key);
            });
        }else{
            //the leaf node
            height_of_current_node = this.blockh;
            //record a line of program's location.
            this.lineLocation[data.key] = y;
        }
       
        this.draw_node(x, y, height_of_current_node, this.blockw, data);
        return height_of_current_node;
    }

    draw_node(x, y, h, w, d){

        this.svg.selectAll('.treenode_'+d.key).data([d]).enter().append('rect')
            .attr('width', w)
            .attr('height', h)
            .attr('x', x)
            .attr('y', y)
            .attr('rx', 5)
            .attr('ry', 5)
            .on('click', function(data){

                let isnum = /^\d+$/.test(data.key);

                if(isnum){
                    d3.selectAll('.tree_node')
                    .classed('tree_node', true)
                    .classed('tree_node_highlight', false);
                
                    d3.select(this).classed('tree_node_highlight', true);
                    publish('SOURCECODE_HIGHLIGHT', {'line':data.key});
                }
            })
            .classed('tree_node', true);

        this.svg.selectAll('.treetext_'+d.key).data([d]).enter().append('text')
            .text(d=>d.key)
            .attr('x', (d, i)=>{
                return x + w / 2;
            })
            .attr('y', (d, i)=>{
                return y + h / 2;
            })
            .classed('programTreeView_text', true)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('font-size', (d, i, node)=>{
                let labelWidth = node[i].getComputedTextLength();
                if (labelWidth < this.blockw) {
                    return null;
                }
                return ((this.blockw - 4) / labelWidth) + 'em';
            })
            .style('pointer-events', 'none');            
    }

    the_node_is_not_a_leaf(data){
        //check whether the child node is DUE, SDC, or Masked
        let outcome_category = new Set(['DUE', 'SDC', 'Masked']);
        return 'key' in data.values[0] && !(outcome_category.has(data.values[0].key));
    }

    setTimerChangeEvent(current){

        this.current_time_step = current;
        this.drawExecutionLineChart();
        this.timer.updateLenLocation(current);
        publish('SOURCECODE_HIGHLIGHT', this.propagationData.getProgramCurrentExecutedLine(current));
    }

    //get the random fault injection data information.
    setSummaryData(msg, data){
        console.log(msg);
        this.propagationData.setSummaryData(data);
    }

    setErrorRunData(msg, data){
        console.log(msg);
        this.init(data);
        this.draw();
    }

    setGoldenRunData(msg, data){
        console.log(msg);
        this.propagationData.setGoldenRunData(data);
    }

    update(step){
        let current_time = this.timer.getCurrentTimeStep();
        if(current_time + step > this.propagationData.goldenRun.length-1 || current_time + step < 0){
            return false;
        }
        else{
            current_time = current_time + step;
            this.timer.setCurrentTimeStep(current_time);
            this.drawExecutionLineChart();
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
        .attr('x', (d, i)=>{return i * 3+this.x + 400;})
        .attr('y', 20)
        .attr('height', 15)
        .attr('width', 3)
        .style('fill', (d, i)=>{return colorScale(d);})

        this.colorscalesvg.selectAll('.errorColorScaleBar').data(['0', this.propagationData.getMaxAbsoluteError().toFixed(2)])
        .enter()
        .append('text')
        .attr('x', (d, i)=>{
            return i == 0? this.x + 400 : this.x + 400 + width * 3;
        })
        .attr('y', 10)
        .text(d=>d)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central'); 

        let filter_anotation = this.colorscalesvg.append('g');
        filter_anotation.append('rect')
        .attr('x', this.x + 350)
        .attr('y', 20)
        .attr('height', 15)
        .attr('width', 15)
        .style('fill', '#f7f7f7')
        .style('stroke', 'gray')
        .style('stroke-opacity', 0.5)
        .style('stroke-width', '1px');;

        filter_anotation.append('text')
        .text('Filter-out')
        .attr('x', this.x + 350)
        .attr('y', 10)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central'); 
    }

    drawExecutionLineChart(){

        let max = -Number.MAX_VALUE;
        for(let i  = 0; i < this.propagationData.filteredAbsolutedError.length; i++){
            max = Math.max(this.propagationData.filteredAbsolutedError[i][1], max);
        }

        let temp_colorscale = d3.scaleLinear().domain([0, max]).range([0,1]).clamp(true);

        let step_w = Math.floor(this.path_width/this.step_size);
        let items = []

        for(let i = this.current_time_step; i < this.current_time_step + this.timer.len_gap && i < this.propagationData.absoluteError.length; i++){   
           items.push([this.propagationData.filteredAbsolutedError[i], i]);
        }

        if(this.excutionLineChart_g != undefined)
            this.excutionLineChart_g.remove();
        this.excutionLineChart_g = this.svg.append('g');

        this.excutionLineChart_g.selectAll('.DynamicFlowPath_rect').data(items).enter()
            .append('rect')
            .attr('x', (d)=>{
                return this.timer.selected_time_axis(d[1]);
            })
            .attr('y', (d)=>{
                return this.lineLocation[d[0][0].split(':')[0]];
            })
            .attr('width', step_w)
            .attr('height', Math.min(step_w, this.blockh))
            .attr('fill', (d)=>{
                if(d[0][1] == 0)
                    return "white";
                else if(d[0][1] == -1)
                    return "#f7f7f7";//gray color
                else 
                    return d3.interpolateOrRd(temp_colorscale(d[0][1]));
            })
            .attr('fill-opacity', (d)=>{
                return d[0][1]!=0?1:0;
            })
            .style('stroke', 'gray')
            .style('stroke-opacity', 0.5)
            .style('stroke-width', '1px');
    }
}