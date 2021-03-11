class SourceCodeView extends BasicView{
    constructor(container){
        super(container);

        //different metric
        this.sdc_ratio = undefined;
        this.sdc_impact = undefined;
        this.sdc_frequency = undefined;
    }

    draw(){
    }

    setData(msg, data){
        this.data = data;

        this.line_data = d3.nest()
        .key(function (d) {
            return d.Line;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
        })
        .key(function (d) {
            return d.outcome
        }).entries(data);

        this.extractDataProperty();

        this.draw();
    }

    extractDataProperty(){
        this.init_SDC_ratio_in_each_Line();
        this.init_SDC_Ratio_Of_EachLine_In_EachIteration();
        this.colorscale = d3.scaleLinear().domain(d3.extent(Object.values(this.sdc_frequency))).range([0,1]);
    }

    init_SDC_ratio_in_each_Line(){
        this.sdc_ratio = {};
        this.sdc_frequency = {};

        this.line_data.forEach(d=>{
            this.sdc_frequency[d.key] = 0;
            let sum = 0;

            d.values.forEach(element=>{
                if(element.key == 'SDC'){
                    this.sdc_frequency[d.key] = element.values.length;
                }
                sum += element.values.length;
            });

            this.sdc_ratio[d.key] = this.sdc_frequency[d.key]/(sum);
        });

        this.line_number = new Set(Object.keys(this.sdc_ratio));
    }

    init_SDC_Ratio_Of_EachLine_In_EachIteration(){
        let lines = {};
        let maxiter = -1;
        
        //extract the iteration information of each line
        for(let item of this.data){
            
            //whether that lines of code exist in the tracker
            if(!(item.Line in lines)){
                lines[item.Line] = {};
            }
            
            let iter = 0;
            if(item.iter != 'init'){
                iter = +item.iter;
            }

            //whether the outcome of current simulation is SDC
            if(!(iter in lines[item.Line]))
                lines[item.Line][iter] = {'DUE':0,'SDC':0,'Masked':0};
                   
            lines[item.Line][iter][item.outcome]++;
            
            
            //tracking the maximum number of iterations
            if(iter > maxiter)
                maxiter = iter;
        }
    
        
        let iter_lines = {};
        //bin the data
        for(let key in lines){
            
            let bin = [];
            /*******
            -1 means , for this iteration, there is not bit corrupted in this line of code.
            ********/
            for(let i = 0; i <= maxiter; i++){
                bin.push(-1);
            }
            
            let line = lines[key];
            for(let it in line){
                    bin[it] = line[it]['SDC']/(line[it]['SDC']+line[it]['Masked']+line[it]['DUE']);
            }	
            iter_lines[key] = bin;
        }
        
        this.line_number_iter = iter_lines;
    }

    setHighLightIndex(msg, data){
        //scroll div to the target line
        let offset = $('#sourceCode_display li')[+data.line-1].offsetTop;
        this.container.getElement()[0].scrollTop = offset - $(this.container.getElement()[0]).height()/2;

        //highlight
        d3.selectAll('#sourceCode_display li')
        .style('background-color', (d, i)=>{
            if(i == data.line -1)
                return "rgb(150, 159, 255)";
            else
                return '';
        })
        .style('list-style-image' ,(d, i)=>{
            if(i == +data.line-1)
                return 'url("../static/src/resource/image/arrow.png")';
            else    
                return '';
        });
    }

    setSourceCodeFile(msg, data){
        $('#sourceCode_display').load('static/code/'+data.split('_')[0]+'.html', ()=>{
            PR.prettyPrint();
        });
    }
}