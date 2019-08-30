class StackBarChart extends standardChildView{

    constructor(svg, x, y, width, height, data){
        super(svg, x, y, width, height, data);
        this.globalflag = false;// default everything is compared globally
    }

    init(){
        this.data.values.sort((a,b)=>{
            if(a.key > b.key)return 1;
           else return -1;
        });

        this.sum = 0.0;
        this.data.values.forEach(element => {
            this.sum += element.values.length;
        });

        this.rescaleRatio();
    }

    draw(){
        this.init();
        let loc_x = this.x;
        
        
        if(this.g == undefined){
            this.g = this.svg.append('g');
            this.g.selectAll('.stackbar_'+this.uuid+'_rect').data(this.data.values)
            .enter()
            .append('rect')
            .attr('x', (d, i)=>{
                let width = 0;
                if(this.globalflag){
                    width = this.x_axis(d.values.length);
                }else{
                    width = d.values.length/this.sum * this.width;
                }
                loc_x += width;
                return loc_x - width;
            })
            .attr('y', this.y)
            .attr('width', (d)=>{
                return this.globalflag ? this.x_axis(d.values.length) : d.values.length/this.sum * this.width;
            })
            .attr('height', this.height)
            .classed('stackbar_'+this.uuid+'_rect', true)
            .classed('stackBarChart_rect', true)
            .style('fill', (d)=>{
                return this.outcomecolor[d.key];
            });
        }else{
            this.g.selectAll('.stackbar_'+this.uuid+'_rect').data(this.data.values)
            .transition(1500)
            .attr('x', (d, i)=>{
                let width = 0;
                if(this.globalflag){
                    width = this.x_axis(d.values.length);
                }else{
                    width = d.values.length/this.sum * this.width;
                }
                loc_x += width;
                return loc_x - width;
            })
            .attr('width', (d)=>{
                return this.globalflag ? this.x_axis(d.values.length) : d.values.length/this.sum * this.width;
            })
        }
    }

    rescaleRatio(){
        
        let dataset = [];
        this.data.values.forEach(element=>{
            dataset = dataset.concat(element.values);
        });

        let highbit_count = {"Crash": 0, "Masked": 0, "SDC": 0, "DUE": 0};
        let lowbit_count = {"Crash": 0, "Masked": 0, "SDC": 0, "DUE": 0};
        let highbit_sum = 0;
        let lowbit_sum = 0;
        for(let i = 0; i < dataset.length; i++){
            if(dataset[i].bit <= 52){
                lowbit_count[dataset[i].outcome]++;
                lowbit_sum++;
            }
            else{
                highbit_count[dataset[i].outcome]++;
                highbit_sum ++;
            }
        }

        let ratio = {"Crash":0, "Masked":0, "SDC":0, "DUE":0};

        for(let key in highbit_count){
            ratio[key] = highbit_count[key]/highbit_sum * 12/64.0 + lowbit_count[key]/lowbit_sum * 52/64.0;
        }

        this.ratio =  ratio;
    }

    clean(){
        if(this.g != undefined){
            this.g.remove();
            this.g = undefined;
        }
    }

    getExperimentCount(){
        return this.sum;
    }
    
    setOutcomeColor(color){
        this.outcomecolor = color;
    }

    setMaxDataSize(size){
        this.maxDataSize = size;
        this.x_axis = d3.scaleLinear().range([0, this.width]).domain([0, this.maxDataSize]);
    }

    setGlobalFlag(flag){
        this.globalflag = flag;
    }
}