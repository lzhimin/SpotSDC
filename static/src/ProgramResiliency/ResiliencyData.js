class ResiliencyData{

    constructor(){
        this.simulation_bucket = {"Masked":[], "SDC":[]};
    }

    setFaultInjectData(data){
        this.faultInjectedData = data;
    }

    setGoldenRun(data){
        this.goldenrun = data;
    }

    setDynamicInstructionIndex(indexs){
        this.faultinjectionIndexs = indexs;
    }

    makeMaskedBoundary(){
        this.maskedBoundary = [];

        let golden = 0, error = 0, current_value = 0;

        for(let i = 0; i < this.goldenrun.length; i++){
            let max_value = 0, min_value = 0;

            for(let j  = 0; j < this.simulation_bucket.Masked.length; j++){
                golden = parseFloat(this.goldenrun[i].value);
                error = parseFloat(this.simulation_bucket.Masked[j][i].value);

                if(golden != 0){
                    current_value = (error-golden)/golden;
                }else{
                    current_value = 0;
                }

                if(current_value > max_value && current_value >= 0) max_value = current_value;
                if(current_value < min_value && current_value < 0) min_value = current_value;
            }

            if(max_value > 1) max_value = Math.log10(max_value);
            if(min_value < -1) min_value = -Math.log10(-min_value);

            this.maskedBoundary.push({"max":max_value, "min":min_value});
        }  
    }

    addSimulations(data){
        //clean
        //this.simulation_bucket.Masked = [];
        //this.simulation_bucket.SDC = [];

        //for(let i = 0; i < data.length; i++){
        //    let outcome = this.faultInjectedData[this.faultinjectionIndexs[i]].outcome;
        //   if(outcome == "DUE")
        //        continue;
        //    this.simulation_bucket[outcome].push(data[i]);
        //}
        //this.makeMaskedBoundary();
        this.maskedBoundary = data;

    }
}