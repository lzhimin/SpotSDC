class ResiliencyView extends BasicView{

    constructor(container){
        super(container);

        this.resiliencydata = new ResiliencyData();
        this.dynamicInstructionIndex = 140;
        this.number_of_sample_generate_boundary = 64;

        this.circle_r = 2;
        this.outcome_color = {
            'DUE': '#542788',
            'Masked': '#1b9e77',
            'SDC': '#d95f02'
        };

        this.percentage = 0;
    }

    init(){
        super.init();
        this.margin.left = 100;
        this.margin.bottom = 100;

        //clean svg
        d3.select('#ResiliencyViewCanvas').html('');
        this.chart = d3.select('#ResiliencyViewCanvas')
            .append('svg')
            .attr("id", "resiliencySvg")
            .attr('width', this.width)
            .attr('height', this.height);

        let indexs = this.generateRandomSimulations();

        fetchMultipleSimulationData(indexs);
        this.resiliencydata.setDynamicInstructionIndex(indexs);
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
        
        //define the brush aread
        d3.select("#resiliencySvg")
            .call(d3.brushX()
            .extent([[this.margin.left, (this.margin.top + (this.height - this.margin.bottom - this.margin.top)/2)- 50],
            [this.width - this.margin.left - this.margin.right, (this.margin.top + (this.height - this.margin.bottom - this.margin.top)/2) + 50]])
            .on("end", this.updatechart.bind(this)));
    }
    
    updatechart(){
        let x1 = d3.event.selection[0];
        let x2 = d3.event.selection[1];

        let first_index = this.x_axis.invert(x1);
        let second_index = this.x_axis.invert(x2);
        //use the index to fetch the data boundary.
        
        

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