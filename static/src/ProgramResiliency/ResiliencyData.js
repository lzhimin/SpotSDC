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
        for(let i = 0; i < this.goldenrun.length; i++){
            let max_value = 0, min_value = 0;
            //console.log(i);
            for(let j  = 0; j < this.simulation_bucket.Masked.length; j++){
                let current_value = parseFloat(this.simulation_bucket.Masked[j][i].value) - parseFloat(this.goldenrun[i].value);

                if(current_value > max_value && current_value >= 0) max_value = current_value;
                if(current_value < min_value && current_value < 0) min_value = current_value;
            }

            if(max_value > 1) max_value = Math.log10(max_value);
            if(min_value < -1) min_value = -Math.log10(-min_value)

            this.maskedBoundary.push([max_value, min_value]);
        }
        
    }

    SdcBoundary(){
        this.sdc = [];
    }

    addSimulations(data){
        //clean
        this.simulation_bucket.Masked = [];
        this.simulation_bucket.SDC = [];

        for(let i = 0; i < data.length; i++){
            let outcome = this.faultInjectedData[this.faultinjectionIndexs[i]].outcome;
            if(outcome == "DUE")
                continue;
            this.simulation_bucket[outcome].push(data[i]);
        }

        this.makeMaskedBoundary();
    }
}