class SourceCodeView extends BasicView{
    constructor(container){
        super(container);


        //different metric
        this.sdc_ratio = undefined;
        this.sdc_impact = undefined;
        this.sdc_frequency = undefined;

        this.colorscale = d3.interpolateOrRd; 
    }

    draw(){
        d3.selectAll('#sourceCode_display li')
        .style('background', (d, i)=>{
            if(this.line_number.has((i+1)+''))
                return this.colorscale(this.sdc_ratio[(i+1)+'']);
        });
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

    setHighLightIndex(msg, data){
        //scroll div to the target line
        let offset = $('#sourceCode_display li')[+data.line-1].offsetTop;
        this.container.getElement()[0].scrollTop = offset - $(this.container.getElement()[0]).height()/2;

        //highlight
        d3.selectAll('#sourceCode_display li')
        .style('list-style-image' ,(d, i)=>{
            if(i == +data.line-1)
                return 'url("../static/src/resource/image/arrow.png")';
            else    
                return '';
        });
        /*.style('background', (d, i)=>{
            if(i == +data.line-1)
                return 'steelblue';
            else if (this.line_number.has((i+1)+''))
                return this.colorscale(this.sdc_ratio[(i+1)+'']);
            else
                return '#f5f5f5';
        });*/
    }

    setSourceCodeFile(msg, data){
        $('#sourceCode_display').load('static/code/'+data.split('_')[0]+'.html', ()=>{
            PR.prettyPrint();
        });
    }
}