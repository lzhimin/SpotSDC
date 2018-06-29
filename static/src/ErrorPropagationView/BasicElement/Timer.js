class Timer{

    constructor(svg, time){

        this.width = 500;
        this.height = 50;

        this.left_padding = 100;
        
        this.svg = svg;
        this.time = time;

        this.current_time_step = 0;

        this.trigger_rect_w = 20;
        this.trigger_rect_h = this.height;
    }

    getCurrentTimeStep(){
        return this.current_time_step
    }

    setCurrentTimeStep(step){
        this.current_time_step = step;

        this.trigger_text
        .text((d, i)=>{
            return i==0 ? this.current_time_step : this.current_time_step + 50;
        })
        .attr('x', (d, i)=>{
            return i==0 ? this.axis_x(this.current_time_step) : this.axis_x(this.current_time_step + 50);
        });
        this.trigger_rect.attr('x', this.axis_x(this.current_time_step));
                
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

        this.axis_x = d3.scaleLinear().range([this.x, this.left_padding + this.width]).domain([0, this.time]);
        this.axis_y = d3.scaleLinear().range([this.y, this.y - this.height]).domain([0, 1]);//relative error the value scale from 0~1
        this.trigger_rect_w = this.axis_x(50) - this.axis_x(0);

        this.svg.append('g').attr('class','axis axis--x')
            .attr("transform", "translate(0,"+ this.y + ")")
            .call(d3.axisBottom(this.axis_x).ticks(20));
        
        this.svg.append('g').attr('class','axis axis--y')
            .attr("transform", "translate("+ (this.x - 5) + ", 0)")
            .call(d3.axisLeft(this.axis_y).ticks(4));

        let line = d3.line().x((d, i)=>{return this.axis_x(i);}).y((d, i)=>{return this.axis_y(d[1]);}).curve(d3.curveStepAfter);
        this.svg.append('path')
            .datum(this.relativeData)
            .classed('timer_error_linechart_line', true)
            .attr("fill", "none")
            .attr('d', line);

        this.trigger_rect = this.svg.append('rect').datum(this.current_time_step)
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
            })
            .on('end', (d)=>{

            })
        );

        this.trigger_text = this.svg.selectAll('.time_trigger_annotation_text').data([this.current_time_step, this.current_time_step+50])
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
    }

    setTimerStepChangeCallBack(func){
        this.callback = func;
    }
}