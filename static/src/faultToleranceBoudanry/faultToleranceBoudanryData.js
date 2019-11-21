class FaultToleranceBoudanryData {

    constructor() {
        this.simulation_bucket = {
            "Masked": [],
            "SDC": []
        };
        //The threshold value for SDC outcome.
        this.threshold = 0.07;
        //display the 99% boundary value correctly and truncate the rest to 99% maximum.
        this.percentage = 0.95;
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

    //here we assume that we have the exhaust fault injection campaign dataset.
    getFaultToleranceBoundary_Relative() {
        let relativeBoundary = [];
        let sdc_relative_error = [];
        let masked_relative_error = [];
        const l = this.faultInjectedData.length;

        for (let i = 0; i < l; i++) {
            let error = Math.abs(+this.faultInjectedData[i].out_xor_relative);
            //get the minimum SDC value and the Masked value below it.
            if (isNaN(error) || !isFinite(error) || error == undefined) {
                if ((i + 1) % 64 != 0) continue;
            } else {
                if (isNaN(this.faultInjectedData[i].diffnormr) || !isFinite(this.faultInjectedData[i].diffnormr)) {
                    //do nothing
                } else if (this.faultInjectedData[i].diffnormr > this.threshold) {
                    sdc_relative_error.push({
                        "error": this.logFunc(error),
                        "norm": this.faultInjectedData[i].diffnormr
                    });
                } else {
                    masked_relative_error.push({
                        "error": this.logFunc(error),
                        "norm": this.faultInjectedData[i].diffnormr
                    });
                }
            }

            if ((i + 1) % 64 == 0) {
                if (sdc_relative_error.length == 0) {
                    relativeBoundary.push(10000);
                } else {

                    //Here use the lowest SDC fault injection to approximate the golden boundary value.
                    let min_sdc = sdc_relative_error.reduce((prev, current) => {
                        return (prev.error < current.error) ? prev : current;
                    });
                    let boundary_masked = {
                        "error": -1
                    };

                    masked_relative_error.forEach((d) => {
                        if (d.error > boundary_masked.error && d.error < min_sdc.error) {
                            boundary_masked = d;
                        }
                    });

                    if (boundary_masked.error == -1) {
                        relativeBoundary.push(min_sdc.error);
                    } else {
                        relativeBoundary.push(this.simpleLinearInterpolation(min_sdc, boundary_masked, this.threshold));
                    }

                }
                sdc_relative_error = [];
                masked_relative_error = [];
            }
        }
        return relativeBoundary;
    }

    // a simple interpolation method
    simpleLinearInterpolation(p1, p2, v) {
        let a = (p2.norm - p1.norm) / (p2.error - p1.error);
        let b = (p1.error * p2.norm - p2.error * p1.norm) / (p1.error - p2.error);
        return (v - b) / a;
    }

    //the percentage of propagation error will be shown
    setPercentage(p) {
        this.percentage = p;
    }

    updateFaultToleranceBoundary() {
        this.faultToleranceBoundaryRelative = this.getFaultToleranceBoundary_Relative();
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

        if (this.percentage == 1)
            return this.logFunc(d3.max(inject_error));

        let q = d3.quantile(inject_error, this.percentage);
        return this.logFunc(q);
    }

    //assume the pass value is positive.
    logFunc(value) {
        if (value < 1)
            return value;
        else
            return Math.log10(value) + 1;
    }

    getExecutionLineNum() {
        let linenum_set = new Set();
        let linenum = [];
        this.goldenrun.forEach((d) => {
            if (!linenum_set.has(d.linenum)) {
                linenum.push(d.linenum);
                linenum_set.add(d.linenum);
            }
        });
        return linenum;
    }
}