class StackBarChart extends standardChildView{

    constructor(svg, x, y, width, height, data){
        super(svg, x, y, width, height, data);
        this.globalflag = false;// default everything is compared globally
    }

    init(){
        this.data.values.sort((a,b)=>{
            return a.key > b.key;
        });

        this.sum = 0.0;
        this.data.values.forEach(element => {
            this.sum += element.values.length;
        });
    }

    draw(){
        this.init();
        let loc_x = this.x;
        
        if(this.g == undefined){
            this.g = this.svg.append('g');
            this.g.selectAll('.stackbar_'+this.uuid+'_rect').data(this.data.values)
            .enter()
            .append('rect')
            .attr('x', (d, i)=>{
                let width = 0;
                if(this.globalflag){
                    width = this.x_axis(d.values.length);
                }else{
                    width = d.values.length/this.sum * this.width;
                }
                loc_x += width;
                return loc_x - width;
            })
            .attr('y', this.y)
            .attr('width', (d)=>{
                return this.globalflag ? this.x_axis(d.values.length):d.values.length/this.sum * this.width;
            })
            .attr('height', this.height)
            .attr('rx', 5)
            .attr('ry', 5)
            .classed('stackbar_'+this.uuid+'_rect', true)
            .classed('stackBarChart_rect', true)
            .style('fill', (d)=>{
                return this.outcomecolor[d.key];
            });
        }else{
            this.g.selectAll('.stackbar_'+this.uuid+'_rect').data(this.data.values)
            .transition(1500)
            .attr('x', (d, i)=>{
                let width = 0;
                if(this.globalflag){
                    width = this.x_axis(d.values.length);
                }else{
                    width = d.values.length/this.sum * this.width;
                }
                loc_x += width;
                return loc_x - width;
            })
            .attr('width', (d)=>{
                return this.globalflag ? this.x_axis(d.values.length):d.values.length/this.sum * this.width;
            })
        }
    }

    clean(){
        if(this.g != undefined){
            this.g.remove();
            this.g = undefined;
        }
    }

    getExperimentCount(){
        return this.sum;
    }
    
    setOutcomeColor(color){
        this.outcomecolor = color;
    }

    setMaxDataSize(size){
        this.maxDataSize = size;
        this.x_axis = d3.scaleLinear().range([0, this.width]).domain([0, this.maxDataSize]);
    }

    setGlobalFlag(flag){
        this.globalflag = flag;
    }
}