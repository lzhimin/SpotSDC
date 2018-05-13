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

    //TODO: what's the inter leaf order of the tree?
    setHierachicalData(pattern){
        let values = null;

        if(pattern == null){
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
            for (let i = 0; i < pattern.length; i++)
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
}