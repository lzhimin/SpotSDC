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
                });
        }

        values.key(function (d) {
            return d.outcome
        });

        this.hierachicalData =  {'key':$('#program_TreeView_file_selector').val().split('_')[0], 'values':values.entries(this.filterData)};
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

    getMinDiff(){
        return this.property.minDiff;
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



    parseDataProperty(){
        this.property = {'maxDiff':-Number.MAX_VALUE, 'minDiff':Number.MAX_VALUE, 'lowestPBit':64};
        this.data.forEach(element=>{

            if(element.outcome == 'SDC' && element.diffnormr != 'inf'){
                let diffnorm = Math.log10(+element.diffnormr);
                this.property.maxDiff = Math.max(this.property.maxDiff, diffnorm);
                this.property.minDiff = Math.min(this.property.minDiff, diffnorm);
            }

            if(element.outcome != 'Masked'){
                this.property.lowestPBit = Math.min(+element.bit-1, this.property.lowestPBit);
            }
        });
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