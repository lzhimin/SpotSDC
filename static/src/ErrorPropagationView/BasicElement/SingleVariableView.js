class SingleVariableView{

    constructor(svg, name, data){
        this.svg = svg;

        this.blockw = 80;
        this.blockh = 30;
        this.padding = 10;

        this.name = name;
        this.data = data;

        this.uuid = uuidv4();
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

    draw(){

        this.svg.selectAll('.singleVariableRect'+'_'+this.uuid)
        .data([this.name])
        .enter()
        .append('rect')
        .attr('x', this.x)
        .attr('y', this.y)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('width', this.blockw)
        .attr('height', this.blockh)
        .classed('singleVariableRect', true);

        this.svg.selectAll('.singleVariableText'+'_'+this.uuid)
        .data([this.name])
        .enter()
        .append('text')
        .text(d=>d)
        .attr('x', this.x + this.blockw/2)
        .attr('y', this.y + this.blockh/2)
        .classed('singleVariableText', true)
        .attr('text-anchor', 'middle')
        .attr('domain-baseline', 'central');

        //draw line chart
        
    }

}