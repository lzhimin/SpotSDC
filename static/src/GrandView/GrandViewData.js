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

        return d3.extent(d);
    }
}