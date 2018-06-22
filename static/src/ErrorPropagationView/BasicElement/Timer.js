class Timer{


    constructor(svg, time){

        this.width = 400;
        this.height = 50;

        this.left_padding = 100;
        
        this.svg = svg;
        this.time = time;

        this.current_time_step = 0;

        this.trigger_circle_r = 20;
    }


    getCurrentTimeStep(){
        return this.current_time_step
    }

    setCurrentTimeStep(step){
        this.current_time_step = step;

        this.trigger_circle.attr('cx', this.axis_x(this.current_time_step));
        this.trigger_text.text(this.current_time_step).attr('x', this.axis_x(this.current_time_step));
                
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

    draw(){

        this.axis_x = d3.scaleLinear().range([this.left_padding, this.x + this.width]).domain([0, this.time]);
        this.axis_y = d3.scaleLinear().range([this.y, this.y - this.height]).domain([0, 1]);//relative error the value scale from 0~1

        this.svg.append('g').attr('class','axis axis--x')
            .attr("transform", "translate(0,"+ this.y + ")")
            .call(d3.axisBottom(this.axis_x).ticks(20));
        
        this.svg.append('g').attr('class','axis axis--y')
            .attr("transform", "translate("+ (this.left_padding - 5) + ", 0)")
            .call(d3.axisLeft(this.axis_y).ticks(5));

        let line = d3.line().x((d, i)=>{return this.axis_x(i);}).y((d, i)=>{return this.axis_y(d[1]);}).curve(d3.curveStepAfter);
        this.svg.append('path')
            .datum(this.relativeData)
            .classed('timer_error_linechart_line', true)
            .attr("fill", "none")
            .attr('d', line);

        this.trigger_circle = this.svg.append('circle').datum(this.current_time_step)
        .attr('cx', this.left_padding)
        .attr('cy', this.y)
        .attr('r', this.trigger_circle_r)
        .classed('Timer_trigger', true)
        .call(d3.drag()
            .on('start', (d)=>{

            })
            .on('drag', (d)=>{
                if(d3.event.x < this.left_padding || d3.event.x > this.x + this.width)
                    return;

                this.trigger_circle.attr('cx', d3.event.x);

                this.current_time_step = Math.floor(this.axis_x.invert(d3.event.x));

                this.trigger_text.text(this.current_time_step).attr('x', this.axis_x(this.current_time_step));
                
                //call back function.
                this.callback(this.current_time_step);
            })
            .on('end', (d)=>{

            })
        );

        this.trigger_text = this.svg.append('text').datum(this.current_time_step)
        .text(d=>d)
        .attr('x', this.x)
        .attr('y', this.y - 2)
        .attr('text-anchor', 'middle')
        .attr('domain-baseline', 'central')
        .classed('timer_trigger_text', true);
    }

    setTimerStepChangeCallBack(func){
        this.callback = func;
    }
}