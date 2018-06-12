class SingleVariableView{

    constructor(svg, name){
        this.svg = svg;

        this.blockw = 80;
        this.blockh = 40;

        this.width = 350;
        this.padding = 20;

        this.name = name;

        this.error_option = 'relative';

        this.uuid = uuidv4();
    }

    setData(data){
        this.absoluteData = this.extractDataByType(data, 'absolute');
        this.relativeData = this.extractDataByType(data, 'relative');
    }

    extractDataByType(data, type){
        
        let l = Math.max(data.error.length, data.golden.length);
        let e = 0;
        let g = 0;

        let values = []

        for(let i = 0; i < l; i++){

            if(i < data.golden.length){
                g = data.golden[i];
            }else{
                g = data.golden[data.golden.length-1];
            }

            if(i < data.error.length){
                e = data.error[i];
            }else{
                e = data.error[data.error.length - 1];
            }

            if(type == 'absolute'){
                e - g != 0 ? values.push(Math.abs(e - g)): values.push(0);
            }
            else if(type == 'relative'){
                if(e == 0 && g == 0)
                    values.push(0);
                else{
                    
                    //values.push(Math.abs(e - g)/(Math.max(Math.abs(e), Math.abs(g))));
                    e - g == 0? values.push(0) : values.push(Math.abs(e - g)/d3.max(this.absoluteData));
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

    getRectWidth(){
        return this.blockw;
    }

    getRectHeight(){
        return this.blockh;
    }

    getPadding(){
        return this.padding;
    }

    getLineChartStartX(){
        return this.x + this.blockw;
    }

    getMaxTimeStep(){
        return this.relativeData.length;
    }

    draw(){
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

        //draw line chart
        if(this.error_option == 'relative')
            this.draw_absolute_error_chart(this.relativeData);
        else
            this.draw_absolute_error_chart(this.absoluteData);
    }


    draw_absolute_error_chart(data){
    
        let x_axis = d3.scaleLinear()
                        .range([this.x + this.padding * 6 + this.blockw, this.x + this.padding + this.width + this.blockw])
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

    setTimerStep(timer){

        if(timer >= this.relativeData.length)
            return;

        this.rects.style('fill', (d, i)=>{
            return this.relativeData[timer] == 0? 'white':d3.interpolateReds(this.relativeData[timer]);
        });
    }


    setErrorOption(option){
        this.error_option = option;
    }
}