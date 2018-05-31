class ErrorPropagationView extends BasicView{
    constructor(container){
        super(container);

        
        this.propagationData = new ErrorPropagationData();
    }

    init(data){
        super.init();

        this.blockw = 80;
        this.blockh = 30;

        this.y = this.top_padding = 150;
        this.x = this.left_padding = 100;
        this.padding = 20;
        this.propagationData.setData(data);

        d3.select('#ErrorPropagationView').html('');
        this.svg = d3.select('#ErrorPropagationView').append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
    }

    setData(msg, data){
        this.init(data);

        this.draw();
    }

    draw(){

        this.svg.selectAll('.propagationVar_'+this.uuid).data(this.propagationData.seqVar)
        .enter()
        .append('rect')
        .attr('x', (d, i)=>{
            return this.x;
        })
        .attr('y', (d, i)=>{
            return this.y + (this.blockh  + this.padding) * i;
        })
        .attr('width', this.blockw)
        .attr('height', this.blockh)
        .classed('propagation_rect', true);


        this.svg.selectAll('.propagation_'+this.uuid).data(this.propagationData.seqVar)
        .enter()
        .append('text')
        .text(d=>d)
        .attr('x', (d, i)=>{
            return this.x + this.blockw/2;
        })
        .attr('y', (d, i)=>{
            return this.y + (this.blockh  + this.padding) * i + this.blockh/2;
        })
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central');

        //if the propagation view is large than the computer screen view,
        //reset the size of svg 
        let currentheight = this.y + (this.blockh + this.padding) * this.propagationData.seqVar.length;
        if(currentheight > this.height){
            this.svg.attr('height', currentheight + this.padding);
        }
    }
}