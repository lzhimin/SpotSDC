class StackBarChart extends standardChildView{

    constructor(svg, x, y, width, height, data){
        super(svg, x, y, width, height, data);

        this.globalflag = true;// default everything is compared globally
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

        let g = this.svg.append('g');
        let loc_x = this.x;

        g.selectAll('.stackbar_'+this.uuid+'_rect').data(this.data.values)
            .enter()
            .append('rect')
            .attr('x', (d, i)=>{
                loc_x += d.values.length/this.sum * this.width;
                return loc_x - d.values.length/this.sum * this.width;
            })
            .attr('y', this.y)
            .attr('width', (d)=>{
                return d.values.length/this.sum * this.width;
            })
            .attr('height', this.height)
            .attr('rx', 5)
            .attr('ry', 5)
            .classed('stackBarChart_rect', true)
            .style('fill', (d)=>{
                return this.outcomecolor[d.key];
            });
    }

    setOutcomeColor(color){
        this.outcomecolor = color;
    }

    setMaxDataSize(size){
        this.maxDataSize = size;
    }

    setGlobalFlag(flag){
        this.globalflag = flag;
    }
}