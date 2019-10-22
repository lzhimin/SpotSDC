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
        this.faultToleranceBoundaryBit = this.getFaultToleranceBoundary_Bit();
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
        const l = this.faultInjectedData.length;

        for (let i = 0; i < l; i++) {
            if (this.faultInjectedData[i].diffnormr > this.threshold) {
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
        return relativeBoundary;
    }

    //here we assume that we have the exhaust fault injection campaign dataset
    getFaultToleranceBoundary_Bit() {
        const bitBoundary = [];
        const l = this.faultInjectedData.length;
        let min_sdc_bit = 64;

        for (let i = 0; i < l; i++) {
            if (this.faultInjectedData[i].diffnormr > this.threshold) {
                min_sdc_bit = +this.faultInjectedData[i].bit;
                bitBoundary.push(min_sdc_bit);
                i += (63 - (min_sdc_bit - 1));
                min_sdc_bit = 64;
            } else if (i % 63 == 0 && i != 0) {
                bitBoundary.push(min_sdc_bit);
            }
        }
        console.log(bitBoundary);
        return bitBoundary;
    }

    updateFaultToleranceBoundary() {
        this.faultToleranceBoundaryRelative = this.getFaultToleranceBoundary_Relative();
        this.faultToleranceBoundaryBit = this.getFaultToleranceBoundary_Bit();
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