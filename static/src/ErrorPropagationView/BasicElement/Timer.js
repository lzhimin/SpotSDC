class Timer{


    constructor(svg, time){

        this.width = 350;
        
        this.svg = svg;
        this.time = time;

        this.current_time_step = 0;

        this.trigger_circle_r = 20;
    }

    setX(x){
        this.x = x;
    }

    setY(y){
        this.y = y;
    }

    draw(){

        this.axis = d3.scaleLinear().range([this.x , this.x + this.width]).domain([0, this.time]);
        
        this.svg.append('g').attr('class','axis axis--x')
            .attr("transform", "translate(0,"+ this.y + ")")
            .call(d3.axisBottom(this.axis).ticks(10));

        this.trigger_circle = this.svg.append('circle').datum(this.current_time_step)
        .attr('cx', this.x)
        .attr('cy', this.y)
        .attr('r', this.trigger_circle_r)
        .classed('Timer_trigger', true)
        .call(d3.drag()
            .on('start', (d)=>{

            })
            .on('drag', (d)=>{
                if(d3.event.x < this.x || d3.event.x > this.x + this.width)
                    return;

                this.trigger_circle.attr('cx', d3.event.x);

                this.current_time_step = Math.floor(this.axis.invert(d3.event.x));

                this.trigger_text.text(this.current_time_step).attr('x', this.axis(this.current_time_step));
                
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