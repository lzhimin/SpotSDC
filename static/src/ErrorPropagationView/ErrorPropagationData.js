class ErrorPropagationData{

    constructor(){
        //get golden run  
        subscribe('IMPACT_FACTOR', this.setImpactFactor.bind(this));
    }

    setData(data){
        this.data = data;

        this.seqVar = this.extractProgramVariableExecutionSequence();

        this.variableDependency = this.extractVariableDynamicDependency();

        this.relativeError = this.parseData_relativeError(data);

        this.absoluteError = this.parseData_AbosluteError(data);
    }

    setGoldenRunData(data){
        this.goldenRun = data;
    }

    setImpactFactor(msg, data){
        this.impactfactor = data;
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
            error[0] = [this.data[0].line+':'+this.data[0].var, this.data[0].value];
        }else{
            error[0] = [this.data[0].line+':'+this.data[0].var, 0];
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
            golden[0] = [this.data[0].line+':'+this.data[0].var, this.goldenRun[0].value];
        }else{
            golden[0] = [this.data[0].line+':'+this.data[0].var, 0];
        }

        for(let i = 1; i < this.goldenRun.length; i++){
            if(this.goldenRun[i].line+':'+this.goldenRun[i].var  == lineVar){
                golden.push([this.data[i].line+':'+this.data[i].var, this.goldenRun[i].value]);
            }else{
                golden.push([this.data[i].line+':'+this.data[i].var, 0]);
            }
        }

        return {'error':error, 'golden':golden};

    }

    getProgramCurrentExecutedLine(time){
        return this.data[time];
    }

    parseData_AbosluteError(){
        let parseData = [];

        let error = 0;

        let lineVar = '';

        //relative error
        for(let i = 0; i < this.goldenRun.length; i++){
            lineVar = this.data[i].line+':'+this.data[i].var;
            error = Math.abs(+this.data[i].value - +this.goldenRun[i].value);
            parseData.push([lineVar, error]);
        }
        
        return parseData;
    }

    //data come in float by float,
    //this function parse all the variable into norm formate
    parseData_relativeError(){

        let parseData = [];

        let error = 0;

        let maxError_variableTable = {};

        let lineVar = '';

        //extract the maximum error of each variable
        for(let i = 0; i < this.seqVar.length; i++){
            maxError_variableTable[this.seqVar[i]] = 0;
        }

        for(let i = 0; i < this.goldenRun.length; i++){
            lineVar = this.data[i].line+':'+this.data[i].var;
            error = Math.abs(+this.data[i].value - +this.goldenRun[i].value);
            maxError_variableTable[lineVar] = Math.max(error, +maxError_variableTable[lineVar]);
        }

        //relative error
        for(let i = 0; i < this.goldenRun.length; i++){
            lineVar = this.data[i].line+':'+this.data[i].var;
            if((+this.goldenRun[i].value) == 0)
                error = Math.abs(+this.data[i].value);
            else{
                error = Math.abs(+this.data[i].value - +this.goldenRun[i].value) / Math.abs(+this.goldenRun[i].value);
            }
            parseData.push([lineVar, this.impactfactor[i] * error]);
        }
        
        return parseData;
    }

    getMaxRelativeError(){
        let max = - Number.MAX_VALUE;
        for(let i = 0; i < this.relativeError.length; i++){
            max = Math.max(+this.relativeError[i][1], max);
        }
        return max;
    }
}