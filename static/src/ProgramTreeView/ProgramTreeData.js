class ProgramTreeData{

    constructor(){  
        this.property = {'maxDiff':-Number.MAX_VALUE, 'minDiff':Number.MAX_VALUE};
    }

    setData(data, pattern = []){
        this.data = data;
        this.filterData = this.data;
        this.setHierachicalData(pattern);

        this.parseDataProperty();
    }

    //TODO: what's the inter leaf order of the tree?
    setHierachicalData(pattern){

        let values = d3.nest();
        this.pattern = pattern;

        if(this.pattern == null){
            values.key(function (d) {
                return d.Function;
            }).key(function (d) {
                return d.Variable;
            }).key(function (d) {
                return d.Line;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
            });
        }
        else if(this.pattern.length > 0){
            for (let i = 0; i < this.pattern.length; i++)
                values.key(function (d) {
                    return d[pattern[i]];
                }).sortKeys(d3.ascending);
        }

        values.key(function (d) {
            return d.outcome
        }).sortKeys(d3.ascending);

        this.hierachicalData =  {'key':$('#program_TreeView_file_selector').val().split('_')[0], 'values':values.entries(this.filterData)};
    }

    getSummaryData(){
        let structure = d3.nest().key((d)=>{
            return d.outcome;
        });

        return {"values":structure.entries(this.filterData)};
    }

    getData(){
        return this.filterData;
    }

    getDataSize(){
        return this.filterData.length;
    }

    getMaxDiff(){
        return this.property.maxDiff;
    }

    getMaxSDCImpact(){
        return this.property.maxSDCImpact;
    }

    getMinSDCImpact(){
        return this.property.minSDCImpact;
    }

    getMinDiff(){
        return this.property.minDiff;
    }

    getMaxInput(){
        return this.property.maxIn;
    }

    getMinInput(){
        return this.property.minIn;
    }

    getLowestProblemBit(){
        return this.property.lowestPBit;
    }

    getHierachicalData(){
        return this.hierachicalData;
    }

    getTreeHeight(){
        return this.pattern.length + 1;
    }

    getFunctionName(line){

        for(let i =0; i < this.data.length; i++){
            if(line == this.data[i].Line){
                return this.data[i].Function;
            }
        }

        throw "Can't find the data relate to this line of code";
    }

    parseDataProperty(){
        this.property = {'maxDiff':-Number.MAX_VALUE, 
                        'minDiff':Number.MAX_VALUE, 
                        'lowestPBit':64,
                        'maxIn':-Number.MAX_VALUE,
                        'minIn':Number.MAX_VALUE,
                        'maxSDCImpact':-Number.MAX_VALUE,
                        'minSDCImpact':Number.MAX_VALUE};

        this.data.forEach(element=>{
            if(element.outcome == 'SDC' && element.diffnormr != 'inf'){
                let diffnorm = Math.log10(+element.diffnormr);
                this.property.maxDiff = Math.max(this.property.maxDiff, diffnorm);
                this.property.minDiff = Math.min(this.property.minDiff, diffnorm);

                if(element.out_xor != 'nan'){
                    this.property.maxSDCImpact = Math.max(this.property.maxSDCImpact, Math.abs(+element.diffnormr/+element.out_xor));
                    this.property.minSDCImpact = Math.min(this.property.minSDCImpact, Math.abs(+element.diffnormr/+element.out_xor));
                }
            }

            if(element.outcome != 'Masked'){
                this.property.lowestPBit = Math.min(+element.bit-1, this.property.lowestPBit);
            }

            if(element.out_xor != 'nan' && Math.abs(+element.out_xor) != 0){
                //if the out_xor is not zero, how to handle infinity/nan.
                let input = Math.log10(Math.abs(+element.out_xor));
                this.property.maxIn = Math.max(this.property.maxIn, input);
                this.property.minIn = Math.min(this.property.minIn, input);
            }
        });

        //extract the impact factor for each location.
        //let output_golden = 3.477474097e-07;
        let bucket = [];
        this.impact_factors = [];

        for(let i = 0; i < this.data.length; i++){

            if((i+1) % 64 == 0){
                this.impact_factors.push(d3.sum(bucket)/bucket.length);
                bucket = [];
            }

            if(this.data[i].outcome != 'DUE' && this.data[i].out_xor != 'nan'){
                if(+this.data[i].out_xor == 0){
                    bucket.push(0);
                }
                else{
                    bucket.push(Math.abs((+this.data[i].diffnormr)/+this.data[i].out_xor));
                }
            }
        }

        publish('IMPACT_FACTOR', this.impact_factors);
    }

    filterDataCallBack(category, filteritems){

        this.filterData = [];
        if(category == 'bit'){
            for(let i = 0; i < this.data.length; i++){
                let item = this.data[i];
                if(!filteritems.has(item.bit)){
                    this.filterData.push(item);
                }
            }
        }
        else if(category == 'outcome'){
            for(let i = 0; i < this.data.length; i++){
                let item = this.data[i];
                if(!filteritems.has(item.outcome)){
                    this.filterData.push(item);
                }
            }
        }
        else if(category == 'diffnorm'){

        }
        else if(category == 'injectError'){

        }else{
            
        }

        //reset the data hierachy
        this.setHierachicalData(this.pattern);

        //reset the data property
        this.parseDataProperty();
    }

}