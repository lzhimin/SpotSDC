class ErrorPropagationData{
    constructor(){
        //get golden run  
    }

    setData(data){
        this.data = data;

        this.seqVar = this.extractProgramVariableExecutionSequence();

        this.sdc_over_time = this.parseData_sdc_over_time();
    }

    setGoldenRunData(data){
        this.goldenRun = data;
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

    parseData_sdc_over_time(){

        let sdc_overtime = [];
        for(let i = 0; i < this.data.length; i++){
            sdc_overtime.push([this.data[i].line+':'+this.data[i].var, this.data[i].sdc]);
        }
        return sdc_overtime;
    }

    /*
    getGolden_Error_SequenceValue(lineVar){

        let golden = [];
        let error = [];

        //parse error data
        if(this.data[0].line + ':' + this.data[0].var == lineVar){
            error[0] = [this.data[i].line+':'+this.data[i].var, this.data[0].value];
        }else{
            error[0] = [this.data[i].line+':'+this.data[i].var, 0];
        }

        for(let i = 1; i < this.data.length; i++){
            if(this.data[i].line+':'+this.data[i].var  == lineVar){
                error.push([this.data[i].line+':'+this.data[i].var, this.data[i].value]);
            }else{
                error.push([this.data[i].line+':'+this.data[i].var, 0]);
                //error.push(error[i-1]);
            }
        }

        //parse golden value
        if(this.goldenRun[0].line + ':' + this.goldenRun[0].var == lineVar){
            golden[0] = [this.data[i].line+':'+this.data[i].var, this.goldenRun[0].value];
        }else{
            golden[0] = [this.data[i].line+':'+this.data[i].var, 0];
        }

        for(let i = 1; i < this.goldenRun.length; i++){
            if(this.goldenRun[i].line+':'+this.goldenRun[i].var  == lineVar){
                golden.push([this.data[i].line+':'+this.data[i].var, this.goldenRun[i].value]);
            }else{
                golden.push([this.data[i].line+':'+this.data[i].var, 0]);
                //golden.push(golden[i-1]);
            }
        }

        return {'error':error, 'golden':golden};

    }
    */
    getProgramCurrentExecutedLine(time){
        return this.data[time];
    }
}