class ResiliencyView extends BasicView{

    constructor(container){
        super(container);

        this.resiliencydata = new ResiliencyData();
        this.dynamicInstructionIndex = 10;

        this.number_of_sample_generate_boundary = 64 * 40;

        this.circle_r = 2;
        this.outcome_color = {
            'DUE': '#542788',
            'Masked': '#1b9e77',
            'SDC': '#d95f02'
        };
    }

    init(){
        super.init();
        
        this.margin.left = 100;
        this.margin.bottom = 100;

        //clean svg
        d3.select('#ResiliencyViewCanvas').html('');
        this.chart = d3.select('#ResiliencyViewCanvas')
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        let indexs = this.generateRandomSimulations();

        //fetchMultipleSimulationData(indexs);
        //this.resiliencydata.setDynamicInstructionIndex(indexs);
    }

    draw(){

        this.x_axis = d3.scaleLinear()
            .domain([0, this.resiliencydata.goldenrun.length])
            .range([this.margin.left, this.width - this.margin.left - this.margin.right]);

        this.chart_axis_x = this.chart.append('g').attr('class','resiliency_axis')
            .attr("transform", "translate(0,"+ (this.margin.top + (this.height - this.margin.bottom - this.margin.top)/2) + ")")
            .call(d3.axisBottom(this.x_axis).ticks(40));
        
        this.y_axis_positive = d3.scaleLinear().domain([d3.max(this.resiliencydata.maskedBoundary, (d)=>{
            return d[0];
        }) * 1.5, 0])
            .range([this.margin.top, (this.height - this.margin.top - this.margin.bottom)/2 + this.margin.top])
            .clamp(true);

        this.y_axis_negative = d3.scaleLinear().domain([0, d3.min(this.resiliencydata.maskedBoundary, (d)=>{
            return d[1];
        }) * 1.5])
            .range([(this.height - this.margin.top - this.margin.bottom)/2 + this.margin.top, (this.height - this.margin.bottom)])
            .clamp(true);
        
        this.chart_axis_y_positive = this.chart.append('g').attr('class','resiliency_axis')
            .attr("transform", "translate("+ (this.margin.left - 5) +", 0)")
            .call(d3.axisLeft(this.y_axis_positive).ticks(10));
        
        this.chart_axis_y_negative = this.chart.append('g').attr('class','resiliency_axis')
            .attr("transform", "translate("+ (this.margin.left - 5) +", 0)")
            .call(d3.axisLeft(this.y_axis_negative).ticks(10));
        
        let masked_up_lineFunc = d3.line()
            .curve(d3.curveBasis)
            .x((d, i)=>{return this.x_axis(i);})
            .y((d)=>{return this.y_axis_positive(d[0]);});
        
        this.chart.append("path")
            .attr("d", masked_up_lineFunc(this.resiliencydata.maskedBoundary))
            .attr("stroke", "black")
            .attr("fill", "#1b9e77")
            .attr("fill-opacity", 0.2);

        let masked_low_lineFunc = d3.line()
            .curve(d3.curveBasis)
            .x((d, i)=>{return this.x_axis(i);})
            .y((d)=>{return this.y_axis_negative(d[1]);});
        
        this.chart.append("path")
            .attr("d", masked_low_lineFunc(this.resiliencydata.maskedBoundary))
            .attr("stroke", "black")
            .attr("fill", "#1b9e77")
            .attr("fill-opacity", 0.2);  
        
        this.chart.append('g').selectAll(".faultInjectionPoint")
            .data(this.resiliencydata.faultInjectedData)
            .enter()
            .filter((d, i)=>{ 
                let index = Math.floor(d.File_index/64)
                
                let flag = d.out_xor < this.resiliencydata.maskedBoundary[index][0] && 
                        d.out_xor >this.resiliencydata.maskedBoundary[index][1];

                return d.outcome != 'DUE' && flag && d.outcome != "Masked"; 
            })
            .append('circle')
            .attr('r', 5)
            .attr("cx", (d, i)=>{ 
                return this.x_axis(Math.floor(d.File_index/64));
            })
            .attr("cy", (d)=>{ 
                let value = d.out_xor;

                if(value >1)
                    value = Math.log10(value);
                else if(value < -1)
                    value = -Math.log10(-value);

                if(value >= 0)
                    return this.y_axis_positive(value);
                else
                    return this.y_axis_negative(value); 
            })
            .attr("r", this.circle_r)
            .attr("fill", (d)=>{ return this.outcome_color[d.outcome]; })
            .attr("fill-opacity", 0.8)
    }

    setGoldenRunData(msg, data){
        this.resiliencydata.setGoldenRun(data);
        console.log(msg+" in Resiliency View.");
    }

    setData(msg, data){
        this.resiliencydata.setFaultInjectData(data);
        console.log(msg + " in Resiliency View.");

        this.init();
    }

    addMultipleSimulation(msg, data){
        this.resiliencydata.addSimulations(data);
        this.draw();
    }

    generateRandomSimulations(){
        let indexs = []
        
        for(let i = 0; i < this.number_of_sample_generate_boundary; i++){
            indexs.push(this.dynamicInstructionIndex * 64 + i);
        }

        return indexs;
    }
}