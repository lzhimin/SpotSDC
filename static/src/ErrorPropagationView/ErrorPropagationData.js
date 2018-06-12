class ErrorPropagationData{
    constructor(){

        //get golden run 
        
    }


    setData(data){
        this.data = this.parseData(data);

        this.seqVar = this.extractProgramVariableExecutionSequence();

        this.variableDependency = this.extractVariableDynamicDependency();
    }

    setGoldenRunData(data){
        this.goldenRun = this.parseData(data);
    }

    extractProgramVariableExecutionSequence(){
        let seq = [];
        this.data.forEach((d)=>{
            if(!seq.includes(d.line+':'+d.var)){
                seq.push(d.line+':'+d.var);
            }
        });
        return seq.sort();
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

    getGolden_Error_SequenceValue(lineVar){

        let golden = [];
        let error = [];

        //parse error data
        if(this.data[0].line + ':' + this.data[0].var == lineVar){
            error[0] = this.data[0].value;
        }else{
            error[0] = 0;
        }

        for(let i = 1; i < this.data.length; i++){
            if(this.data[i].line+':'+this.data[i].var  == lineVar){
                error.push(this.data[i].value);
            }else{
                error.push(error[i-1]);
            }
        }

        //parse golden value
        if(this.goldenRun[0].line + ':' + this.goldenRun[0].var == lineVar){
            golden[0] = this.goldenRun[0].value;
        }else{
            golden[0] = 0;
        }

        for(let i = 1; i < this.goldenRun.length; i++){
            if(this.goldenRun[i].line+':'+this.goldenRun[i].var  == lineVar){
                golden.push(this.goldenRun[i].value);
            }else{
                golden.push(golden[i-1]);
            }
        }

        return {'error':error, 'golden':golden};

    }

    getProgramCurrentExecutedLine(time){
        return this.data[time];
    }

    //data come in float by float,
    //this function parse all the variable into norm formate
    parseData(data){

        /*
        let parseData = [];

        let temp = [+data[0].value];

        let currentItem = data[0];

        for(let i = 1; i < data.length; i++){

            if(data[i].var == currentItem.var && data[i].line == currentItem.line){
                temp.push(+data[i].value);
            }
            else{
                let item = Object.assign({}, currentItem);
                item.value = this.l2_norm(temp);
                parseData.push(item);

                temp = [+data[i].value];
                currentItem = data[i];
            }      
        }
        return parseData;*/
        return data;
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