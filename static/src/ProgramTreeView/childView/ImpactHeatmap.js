class ImpactHeatmap extends standardChildView{
    constructor(svg, x, y, width, height, data, maxDiff, minDiff){
        super(svg, x, y, width, height, data);

        this.threshold = 0.07;
        this.maxLogDiff = maxDiff;
        this.minLogDiff = minDiff;
        this.sdc_bin_size = 10;

        this.hist = this.histogram1D();
    }

    clear(){

        if(this.g != undefined)
            this.g.remove();
    }

    setOutcomeColor(color){
        this.outcomeColor = color;
    }

    setMaxDiff(v){
        this.maxLogDiff = v;
    }

    setMinDiff(v){
        this.minLogDiff = v;
    }

    draw(){

        this.clear();

        let rect_w = this.width / this.sdc_bin_size;
        let colorscale = d3.scaleQuantize().domain([0, d3.sum(this.hist, (d)=>{return d.length})]).range(this.outcomeColor);
        //let colorscale = d3.scaleLinear().domain([0, d3.sum(this.hist, (d)=>{return d.length})]).range([0, 1]);

        this.g = this.svg.append('g').selectAll('.heatmap1d'+this.uuid+'_rect')
        .data(this.hist)
        .enter()
        .append('rect')
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('x', (d, i)=>{
            return this.x + i * rect_w + (rect_w -(i+10)/20* rect_w)/2;
        })
        .attr('y', (d, i)=>{
            return this.y + (this.height -(i+10)/20 * this.height)/2;
        })
        .attr('width', (d, i)=>{
            return ((i+10)/20)* rect_w;
        })
        .attr('height', (d, i)=>{
            return ((i+10)/20) * this.height;
        })
        .style('fill', (d)=>{
            return d.length == 0? 'white': colorscale(d.length);
            //return d3.interpolateViridis(colorscale(d.length));
        })
        .style('stroke', 'gray')
        .style('stroke-width', '1px')
        .on('click',(d)=>{
            publish('SUBSETDATA', d);
        });
    }

    histogram1D(){
        let sdc_distribution = [];

        for(let i = 0; i < this.sdc_bin_size; i++){
            sdc_distribution.push([]);
        }

        this.data.values.forEach(element => {
            if(element.key == 'SDC'){
                this.sdc_bin(element.values, sdc_distribution);
            }
        }); 
        
        return sdc_distribution;
    }

    sdc_bin(sdc_values, bins){
        let range = []
        for(let i = 0; i < this.sdc_bin_size; i++){
            range.push(i);
        }

        let scale = d3.scaleQuantize().domain([this.minLogDiff, this.maxLogDiff]).range(range);

        sdc_values.forEach((d)=>{
            if(d.diffnormr!='inf')
                bins[scale(Math.log10(+d.diffnormr))].push(d);
            else
                bins[bins.length - 1].push(d);
        });
    }
}