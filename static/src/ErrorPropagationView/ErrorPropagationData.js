class ErrorPropagationData{
    constructor(){

    }


    setData(data){
        this.data = data;

        this.seqVar = this.extractProgramVariableExecutionSequence();

        this.variableDependency = this.extractVariableDynamicDependency();
    }


    extractProgramVariableExecutionSequence(){
        let seq = [];
        this.data.forEach((d)=>{
            if(!seq.includes(d.var)){
                seq.push(d.var);
            }
        });

        return seq;
    }

    extractVariableDynamicDependency(){
        
    }
}