class ScatterPlotData{

    constructor(data){
        this.data = data;
    }
    
    getMaxMin_Absolute(){
        let d = [];
        for(let i = 0; i < this.data.length; i++){
            if(this.data[i].diffnormr != 'nan')
                d.push(Math.log10(+this.data[i].diffnormr));
        }
        return [0, d3.max(d)];
    }

    getInputVsOutput(){
        let datasets = [];
        for(let i = 0; i < this.data.length; i++){
            let d = {};
            d['x'] = Math.abs(this.data[i].out_xor);
            d['y'] = Math.abs(this.data[i].diffnormr);
            d['outcome'] = this.data[i].outcome;
            d['data'] = this.data[i];

            if(d['x'] > 1){
                d['x'] = Math.log10(d['x']);
            } 
            if(d['y'] > 1){
                d['y'] = Math.log10(d['y']);
            }
            datasets.push(d);
        }
        return datasets;
    }

    getNumberOfDynamicInstruction(){
        let l = this.data.length;
        return this.data[l-1].DI;
    }
}