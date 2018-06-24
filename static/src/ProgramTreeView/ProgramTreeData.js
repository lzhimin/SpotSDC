class ProgramTreeData{

    constructor(){
        
    }

    setData(data, pattern = null){
        this.data = data;
        this.setHierachicalData(pattern);
    }

    getData(){
        return this.data;
    }

    getDataSize(){
        return this.data.length;
    }

    //TODO: what's the inter leaf order of the tree?
    setHierachicalData(pattern){

        let values = null;
        this.pattern = pattern;

        if(this.pattern == null){
            values = d3.nest()
            .key(function (d) {
                return d.Function;
            }).key(function (d) {
                return d.Variable;
            }).key(function (d) {
                return d.Line;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
            }).key(function (d) {
                return d.outcome;
            });
        }
        else{
            values =  d3.nest();
            for (let i = 0; i < this.pattern.length; i++)
                values.key(function (d) {
                    return d[pattern[i]];
                });
            //values.key(function(d){return d[pattern[i].toLowerCase()];});
            values.key(function (d) {
                return d.outcome
            });
        }
        this.hierachicalData =  {'key':'program', 'values':values.entries(this.data)};
    }

    getHierachicalData(){
        return this.hierachicalData;
    }

    getTreeHeight(){
        return this.pattern.length + 1;
    }
}