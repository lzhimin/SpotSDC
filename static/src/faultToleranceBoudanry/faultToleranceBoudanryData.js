class FaultToleranceBoudanryData {

    constructor() {
        this.simulation_bucket = {
            "Masked": [],
            "SDC": []
        };

        //The threshold value for SDC outcome.
        this.threshold = 0.07;
    }

    setFaultInjectData(data) {
        this.faultInjectedData = data;
        this.samplingData = this.sampling();
        this.faultToleranceBoundaryRelative = this.getFaultToleranceBoundary_Relative();
    }

    setGoldenRun(data) {
        this.goldenrun = data;
    }

    setDynamicInstructionIndex(indexs) {
        this.faultinjectionIndexs = indexs;
    }

    makeMaskedBoundary() {
        this.maskedBoundary = [];

        let golden = 0,
            error = 0,
            current_value = 0;

        for (let i = 0; i < this.goldenrun.length; i++) {
            let max_value = 0,
                min_value = 0;

            for (let j = 0; j < this.simulation_bucket.Masked.length; j++) {
                golden = parseFloat(this.goldenrun[i].value);
                error = parseFloat(this.simulation_bucket.Masked[j][i].value);

                if (golden != 0) {
                    current_value = (error - golden) / golden;
                } else {
                    current_value = 0;
                }

                if (current_value > max_value && current_value >= 0) max_value = current_value;
                if (current_value < min_value && current_value < 0) min_value = current_value;
            }

            if (max_value > 1) max_value = Math.log10(max_value);
            if (min_value < -1) min_value = -Math.log10(-min_value);

            this.maskedBoundary.push({
                "max": max_value,
                "min": min_value
            });
        }
    }

    addSimulations(data) {
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

    //here we assume that we have the exhaust fault injection campaign dataset
    getFaultToleranceBoundary_Relative() {
        let relativeBoundary = [];
        let relative_error = [];
        for (let i = 0; i < this.faultInjectedData.length; i++) {
            /*if (this.faultInjectedData[i].outcome == "Masked") {
                relative_error = this.logFunc(Math.abs(this.faultInjectedData[i].out_xor_relative));
                if (boundaryvalue < relative_error)
                    boundaryvalue = relative_error;

                if (this.faultInjectedData[i].bit % 64 == 0 && i != 0)
                    relativeBoundary.push(boundaryvalue);
            } else if ((i + 1) < this.faultInjectedData.length && this.faultInjectedData[i + 1].outcome == "SDC") {
                relativeBoundary.push(boundaryvalue);
                boundaryvalue = -1;
                i = i + (63 - i % 64); //jump to next bit
            }*/


            if (this.faultInjectedData[i].diffnormr > this.threshold) { // == 'SDC') {
                let error = Math.abs(+this.faultInjectedData[i].out_xor_relative);
                if (isNaN(error) || !isFinite(error) || error == undefined)
                    continue;
                relative_error.push(this.logFunc(error));
            }

            if ((i + 1) % 64 == 0) {
                if (relative_error.length == 0)
                    relativeBoundary.push(10000);
                else

                    relativeBoundary.push(d3.min(relative_error));
                relative_error = [];
            }

        }
        console.log(relativeBoundary);
        return relativeBoundary;
    }


    //here we assume that we have the exhaust fault injection campaign dataset
    getFaultToleranceBoudanry_Bit() {
        let bitBoundary = [];
        let bit_error = -1,
            boundary_bit = -1;
        for (let i = 0; i < this.faultInjectedData.length; i++) {

        }
    }

    sampling(n = 1000) {
        let data = [];
        let index = Math.floor(Math.random() * this.faultInjectedData.length);
        for (let i = 0; i < n; i++) {
            data.push(this.faultInjectedData[index]);
            index = Math.floor(Math.random() * this.faultInjectedData.length);
        }
        return data;
    }

    //get sample max return the maximum inject error by applying the boxplot's 
    //outlier detection rule.
    getSampleMax() {

        let inject_error = this.samplingData.map((d) => Math.abs(+d.out_xor_relative)).sort(function (a, b) {
            if (isNaN(a) || !isFinite(a))
                return 1;
            if (isNaN(b) || !isFinite(b))
                return -1;
            return a - b
        });

        //let q3 = d3.quantile(inject_error, 0.75);
        //let q1 = d3.quantile(inject_error, 0.25);
        let q95 = d3.quantile(inject_error, 0.95);

        //return this.logFunc(q3 + (q3 - q1) * 1.5);
        return this.logFunc(q95);
    }

    //assume the pass value is positive.
    logFunc(value) {
        if (value < 1)
            return value;
        else
            return Math.log10(value) + 1;
    }
}