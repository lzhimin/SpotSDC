class ResiliencyView extends BasicView{

    constructor(container){
        super(container);

        this.data = [];
        
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

        this.draw();
    }

    draw(){
        
        this.x_axis = d3.scaleLinear()
            .domain([0, this.goldenrun.length])
            .range([this.margin.left, this.width - this.margin.left - this.margin.right]);

        this.chart_axis_x = this.chart.append('g').attr('class','resiliency_axis')
            .attr("transform", "translate(0,"+ (this.height - this.margin.bottom) + ")")
            .call(d3.axisBottom(this.x_axis).ticks(40));


        //Query a test data point.
        let d_instruction = 100;
        fetchSingleSimulationData(d_instruction * 64);

        
    }

    setGoldenRunData(msg, data){
        this.goldenrun = data;
        console.log(msg+" in Resiliency View.");
    }

    setSingleSimulationRun(msg, data){
        
    }

    setData(msg, data){
        this.data = data;
        console.log(msg + " in Resiliency View.");

        this.init();
    }
}