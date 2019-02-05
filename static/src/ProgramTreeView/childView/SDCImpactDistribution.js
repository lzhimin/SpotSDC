class SDCImpactDistribution extends standardChildView{
    
    constructor(svg, x, y, width, height, data, maxSDCImpact, minSDCImpact){
        super(svg, x, y, width, height, data);

        this.threshold = 0.07;
        this.maxSDCImpact = maxSDCImpact;
        this.minSDCImpact = minSDCImpact;
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

    setMaxSDCImpact(v){
        this.maxSDCImpact = v;
    }

    setMinSDCImpact(v){
        this.minSDCImpact = v;
    }

    draw(){

        this.clear();

        let rect_w = this.width / this.sdc_bin_size;
        let colorscale = d3.scaleQuantize().domain([0, d3.sum(this.hist, (d)=>{return d.length})]).range(this.outcomeColor);
    

        this.g = this.svg.append('g').selectAll('.heatmap1d'+this.uuid+'_rect')
        .data(this.hist)
        .enter()
        .append('rect')
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('x', (d, i)=>{
            return this.x + i * rect_w;
        })
        .attr('y', (d, i)=>{
            return this.y;
        })
        .attr('width', rect_w)
        .attr('height', this.height)
        .style('fill', (d)=>{
            return d.length == 0? 'white': colorscale(d.length);
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
                this.sdcImpact_bin(element.values, sdc_distribution);
            }
        }); 
        
        return sdc_distribution;
    }
    /**
     * @param {*} sdc_values 
     * @param {*} bins 
     */

    sdcImpact_bin(sdc_values, bins){

        let range = []
        for(let i = 0; i < this.sdc_bin_size; i++){
            range.push(i);
        }
        let scale = d3.scaleQuantize().domain([0, 10]).range(range);

        sdc_values.forEach((d)=>{
            if(d.out_xor != 'nan' && d.diffnormr !='inf'){
                let SDCImpact = Math.abs(+d.diffnormr/+d.out_xor);
                if(SDCImpact < 10)
                    bins[0].push(d);
                else
                    bins[scale(Math.log10(SDCImpact))].push(d);
            }
        });
    }
}

