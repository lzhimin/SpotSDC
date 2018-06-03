class ErrorPropagationData{
    constructor(){

        //get golden run 
        
    }


    setData(data){
        this.data = this.parseData(data);

        this.seqVar = this.extractProgramVariableExecutionSequence();

        this.variableDependency = this.extractVariableDynamicDependency();
    }

    extractProgramVariableExecutionSequence(){
        let seq = [];
        this.data.forEach((d)=>{
            if(!seq.includes(d.line+':'+d.var)){
                seq.push(d.line+':'+d.var);
            }
        });

        return seq;
    }

    extractVariableDynamicDependency(){
        
        let currentVar = this.data[0];
        let nextVar = this.data[0];
        let flowPath = [];

        for(let i = 1; i < this.data.length; i++){
            nextVar = this.data[i];

            if(nextVar.var == currentVar.var && nextVar.line == currentVar.line)
                continue;
            
            if(!flowPath.includes(currentVar.line+':'+currentVar.var+' '+nextVar.line+':'+nextVar.var))
                flowPath.push(currentVar.line+':'+currentVar.var+' '+nextVar.line+':'+nextVar.var);
            currentVar = nextVar;
        }

        return flowPath;
    }

    getLineVar_SequenceValue(lineVar){

        let values = [];

        if(this.data[0].line + ':' + this.data[0].var == lineVar){
            values[0] = this.data[0].value;
        }else{
            values[0] = 0;
        }

        for(let i = 0; i < this.data.length; i++){
            if(this.data[i].line+':'+this.data[i].var  == lineVar){
                values.push(this.data[i].value);
            }else{
                values.push(values[i-1]);
            }
        }

        return values;
    }

    //data come in float by float,
    //this function parse all the variable into norm formate
    parseData(data){

        let parseData = [];

        let temp = [];

        let currentItem = data[0];

        for(let i = 1; i < data.length; i++){

            if(data[i].var == currentItem.var && data[i].line == currentItem.line){
                temp.push(data[i].value);
            }
            else{
                let item = Object.assign({}, currentItem);
                item.value = this.l2_norm(temp);
                parseData.push(item);

                currentItem = data[i];
            }      
        }
        return parseData;
    }

    l2_norm(array){
        if(array.length == 1){
            return array[0];
        }
        else{
            let sum_square = 0;

            array.forEach(d=>{
                sum_square += (d * d);
            });

            return Math.sqrt(sum_square);
        }
    }
    
}