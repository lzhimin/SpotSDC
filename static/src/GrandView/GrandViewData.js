class GrandViewData{


    constructor(data){
        this.data = data;
    }


    getMaxMin_Absolute(){
        let d = [];
        for(let i = 0; i < this.data.length; i++){
            if(this.data[i].diffnormr != 'nan')
                d.push(Math.log10(+this.data[i].diffnormr));
        }

        return [0, d3.max(d)];
    }


    getNumberOfDynamicInstruction(){
        let l = this.data.length;
        return this.data[l-1].DI;
    }
}