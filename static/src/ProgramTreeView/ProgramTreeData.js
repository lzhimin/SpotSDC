class ProgramTreeData{

    constructor(){
        
    }

    setData(data, pattern = []){
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

        this.hierachicalData =  {'key':$('#program_TreeView_file_selector').val().split('_')[0], 'values':values.entries(this.data)};
    }

    getHierachicalData(){
        return this.hierachicalData;
    }

    getTreeHeight(){
        return this.pattern.length + 1;
    }
}