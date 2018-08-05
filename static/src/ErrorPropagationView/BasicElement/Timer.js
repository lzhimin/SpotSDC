class Timer{

    constructor(svg, time){
        this.width = 500;
        this.height = 50;

        this.left_padding = 100;
        
        this.svg = svg;
        this.time = time;

        this.current_time_step = 0;

        this.display_var = new Set();

        this.trigger_rect_w = 20;
        this.trigger_rect_h = this.height;


        this.len_x1 = -25;//the size of len need to be bigger than 10
    }

    getCurrentTimeStep(){
        return this.current_time_step
    }

    getWidth(){
        return this.width;
    }

    setTimerStepChangeCallBack(func){
        this.callback = func;
    }

    setCurrentTimeStep(step){
        this.current_time_step = step;

        this.trigger_text
        .text((d, i)=>{
            return i==0 ? this.current_time_step - Math.floor(this.len_width/2): this.current_time_step + Math.floor(this.len_width/2);
        })
        .attr('x', (d, i)=>{
            return i==0 ? this.axis_x(this.current_time_step - Math.floor(this.len_width/2)) : this.axis_x(this.current_time_step + Math.floor(this.len_width/2));
        });
        this.trigger_rect.attr('x', this.axis_x(this.current_time_step));

        this.draw_select_time_intervel();
                
    }

    setRelativeData(data){
        this.relativeData = data;
    }

    setX(x){
        this.x = x;
    }

    setY(y){
        this.y = y;
    }

    setWidth(w){
        this.width = w;
    }

    draw(){

        this.axis_x = d3.scaleLinear().range([this.x, this.x + this.width]).domain([0, this.time]);
        this.axis_y = d3.scaleLinear().range([this.y, this.y - this.height]).domain([0, 1]);//relative error the value scale from 0~1
        this.trigger_rect_w = this.axis_x(this.len_width) - this.axis_x(0);

        this.svg.append('g').attr('class','axis axis--x')
            .attr("transform", "translate(0,"+ this.y + ")")
            .call(d3.axisBottom(this.axis_x).ticks(20));
        
        this.svg.append('g').attr('class','axis axis--y')
            .attr("transform", "translate("+ (this.x - 5) + ", 0)")
            .call(d3.axisLeft(this.axis_y).ticks(4));

        this.linefunc = d3.line().x((d, i)=>{return this.axis_x(i);}).y((d, i)=>{return this.axis_y(d[1]);}).curve(d3.curveStepAfter);
        this.relativeErrorPath = this.svg.append('path')
            .datum(this.relativeData)
            .classed('timer_error_linechart_line', true)
            .attr("fill", "none")
            .attr('d', this.linefunc);

        this.trigger_rect = this.svg.append('rect').datum(this.current_time_step - Math.floor(this.len_width/2))
        .attr('x', this.x)
        .attr('y', this.y - this.trigger_rect_h)
        .attr('width', this.trigger_rect_w)
        .attr('height', this.trigger_rect_h)
        .classed('Timer_trigger', true)
        .call(d3.drag()
            .on('start', (d)=>{

            })
            .on('drag', (d)=>{
                if(d3.event.x < this.x || d3.event.x > this.x + this.width)
                    return;

                this.trigger_rect.attr('x', d3.event.x);

                this.current_time_step = Math.floor(this.axis_x.invert(d3.event.x));

                this.trigger_text.text((d,i)=>{
                    return i == 0? this.current_time_step : this.current_time_step + 50;
                }).attr('x', (d, i)=>{
                    return i == 0? this.axis_x(this.current_time_step) : this.axis_x(this.current_time_step + 50);
                });
                
                //call back function.
                this.callback(this.current_time_step);
                this.draw_select_time_intervel();
            })
            .on('end', (d)=>{

            })
        );

        this.trigger_text = this.svg.selectAll('.time_trigger_annotation_text').data([this.current_time_step - Math.floor(this.len_width/2), this.current_time_step + Math.floor(this.len_width/2)])
        .enter()
        .append('text')
        .text(d=>d)
        .attr('x', (d, i)=>{
            return i==0 ? this.x : this.x + this.trigger_rect_w;
        })
        .attr('y', this.y - this.trigger_rect_h)
        .attr('text-anchor', 'middle')
        .attr('domain-baseline', 'central')
        .classed('timer_trigger_text', true);

        //init error indication
        let init_index = this.getFirstErrorIndex();
        this.svg.append('path').datum([init_index])
        .attr('d', d3.symbol().size(100).type(d3.symbolTriangle)())
        .attr('transform',(d)=>{
            return 'translate('+this.axis_x(d)+','+(this.y+10)+')';
        })
        .attr('fill', 'red');

        //timer series lens
        this.draw_select_time_intervel();
    }

    draw_select_time_intervel(){
        let selected_time_axis = d3.scaleLinear().range([this.x, this.x + this.width]).domain([this.current_time_step, this.current_time_step + this.len_width]);
        let linefunc = d3.line().x((d, i)=>{
            return selected_time_axis(d[1]);
        }).y((d)=>{
            return this.axis_y(d[0][1]) + 100;
        }).curve(d3.curveStepAfter);

        if(this.selected_time_x_axis_g == undefined){
            this.selected_time_x_axis_g = this.svg.append('g');
            this.selected_time_x_axis_g.attr('class','axis axis--x')
                .attr("transform", "translate(0,"+ (this.y + 100) + ")")
                .call(d3.axisBottom(selected_time_axis).ticks(20));
            
            this.selected_time_y_axis_g = this.svg.append('g');
            this.selected_time_y_axis_g.attr('class', 'axis axis--y')
                .attr('transform', "translate("+(this.x - 5)+","+ (this.y - 20) + ")")
                .call(d3.axisLeft(this.axis_y).ticks(4));

            this.selected_time_path_g = this.svg.append('g');
            this.selected_time_path_g.append('path')
            .datum(()=>{
                let data = [];
                for(let i = this.current_time_step; i < this.current_time_step + this.len_width && i < this.relativeData.length; i++){
                    data.push([this.relativeData[i], i]);
                }
                return data;
            })
            .classed('timer_error_linechart_line', true)
            .attr("fill", "none")
            .attr('d', linefunc);
        }
        else{
            //this.selected_time_axis_g
            this.selected_time_x_axis_g.call(d3.axisBottom(selected_time_axis).ticks(20));
            this.selected_time_path_g.remove();
            this.selected_time_path_g = this.svg.append('g');
            this.selected_time_path_g.append('path')
            .datum(()=>{
                let data = [];
                for(let i = this.current_time_step; i < this.current_time_step+ this.len_width && i < this.relativeData.length; i++){
                    data.push([this.relativeData[i], i]);
                }
                return data;
            })
            .classed('timer_error_linechart_line', true)
            .attr("fill", "none")
            .attr('d', linefunc);
        }
        //connecting path
        let path = [];
        let line = d3.line().x((d)=>{return d[0];}).y((d)=>{return d[1];});//.curve(d3.curveStepAfter);
        path.push([this.x, this.y + 100]);
        path.push([this.x, this.y + 40]);
        //path.push([+this.trigger_rect.attr('x'), this.y + 30]);
        path.push([+this.trigger_rect.attr('x'), this.y]);
        path.push([(+this.trigger_rect.attr('x')) + (+this.trigger_rect.attr('width')), this.y]);
        //path.push([(+this.trigger_rect.attr('x')) + (+this.trigger_rect.attr('width')), this.y + 30]);
        path.push([this.x + this.width, this.y + 40]);
        path.push([this.x + this.width, this.y + 100]);
        
        if(this.selected_time_axis_connector == undefined){
            this.selected_time_axis_connector = this.svg.append('path')
            .datum(path)
            .attr('d', line)
            .classed("Timer_trigger", true);
        }    
        else{
            this.selected_time_axis_connector.datum(path)
            .attr('d', line);
        }
        //

    }

    setDisplayVariable(variable){
        if(this.display_var.has(variable)){
            this.display_var.delete(variable);
        }else{
            this.display_var.add(variable);
        }

        let filterdata =[];
        for(let i = 0; i < this.relativeData.length; i++){
            if(this.display_var.has(this.relativeData[i][0]))
                filterdata.push(this.relativeData[i]);
            else{
                filterdata.push([0, 0]);
            }
        }

        if(this.display_var.size == 0){
            filterdata = this.relativeData;
        }

        this.relativeErrorPath.datum(filterdata)
        .attr('d', this.linefunc);
    }

    getFirstErrorIndex(){

        let index = -1;
        for(let i = 0; i < this.relativeData.length; i++){
            if(this.relativeData[i][1] != 0){
                index = i;
                break;
            }
        }
        return index;
    }

}