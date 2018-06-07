class Timer{


    constructor(svg, time){

        this.width = 350;
        
        this.svg = svg;
        this.time = time;
    }


    setX(x){
        this.x = x;
    }

    setY(y){
        this.y = y;
    }

    draw(){

        let axis = d3.scaleLinear().range([this.x , this.x + this.width]).domain([0, this.time]);
        
        this.svg.append('g').attr('class','axis axis--x')
            .attr("transform", "translate(0,"+ this.y + ")")
            .call(d3.axisBottom(axis).ticks(10));
    }

}