class ResiliencyView extends BasicView {

    constructor(container) {
        super(container);

        this.resiliencydata = new ResiliencyData();
        this.dynamicInstructionIndex = 140;
        this.number_of_sample_generate_boundary = 64;

        this.circle_r = 4;
        this.outcome_color = {
            'DUE': '#542788',
            'Masked': '#1b9e77',
            'SDC': '#d95f02'
        };

        this.percentage = 0;
    }

    init() {
        super.init();
        this.margin.left = 100;
        this.margin.bottom = 100;

        //clean svg
        d3.select('#ResiliencyViewCanvas').html('');
        this.chart = d3.select('#ResiliencyViewCanvas')
            .append('svg')
            .attr("id", "resiliencySvg")
            .attr('width', this.width)
            .attr('height', this.height)
            .append("g");

        let dataset = $("#program_TreeView_file_selector").val();
        let data_info = {
            "type": "masked_boundary",
            "first": 1,
            "second": 2,
            "dataset": dataset
        };

        fetchGoldenSimulationData(dataset)
        fetchMultipleSimulationData(data_info);
    }

    draw() {

        this.chart.html("");

        //selective choose a simulation run
        this.single_simulation_line = this.chart.append("g");

        this.x_axis = d3.scaleLinear()
            .domain([0, this.resiliencydata.goldenrun.length])
            .range([this.margin.left, this.width - this.margin.left - this.margin.right]);

        this.chart_axis_x = this.chart.append('g').attr('class', 'resiliency_axis')
            .attr("transform", "translate(0," + (this.margin.top + (this.height - this.margin.bottom - this.margin.top) / 2) + ")")
            .call(d3.axisBottom(this.x_axis).ticks(20));

        this.y_axis_positive = d3.scaleLinear().domain([d3.min(this.resiliencydata.maskedBoundary, (d) => {
                return d.max;
            }) * 1.5, 0])
            .range([this.margin.top, (this.height - this.margin.top - this.margin.bottom) / 2 + this.margin.top])
            .clamp(true);

        this.y_axis_negative = d3.scaleLinear().domain([0, d3.min(this.resiliencydata.maskedBoundary, (d) => {
                return d.min;
            }) * 1.5])
            .range([(this.height - this.margin.top - this.margin.bottom) / 2 + this.margin.top, (this.height - this.margin.bottom)])
            .clamp(true);

        this.chart_axis_y_positive = this.chart.append('g').attr('class', 'resiliency_axis')
            .attr("transform", "translate(" + (this.margin.left - 5) + ", 0)")
            .call(d3.axisLeft(this.y_axis_positive).ticks(10));

        this.chart_axis_y_negative = this.chart.append('g').attr('class', 'resiliency_axis')
            .attr("transform", "translate(" + (this.margin.left - 5) + ", 0)")
            .call(d3.axisLeft(this.y_axis_negative).ticks(10));

        //define the brush aread
        d3.select("#resiliencySvg")
            .call(d3.brushX()
                .extent([
                    [this.margin.left, (this.margin.top + (this.height - this.margin.bottom - this.margin.top) / 2) - 20],
                    [this.width - this.margin.left - this.margin.right, (this.margin.top + (this.height - this.margin.bottom - this.margin.top) / 2) + 20]
                ])
                .on("end", this.brushEvent.bind(this)));

        let masked_up_lineFunc = d3.line()
            .curve(d3.curveBasis)
            .x((d, i) => {
                return this.x_axis(i);
            })
            .y((d) => {
                return this.y_axis_positive(d.max);
            });

        this.chart.append("path")
            .attr("d", masked_up_lineFunc(this.resiliencydata.maskedBoundary))
            .attr("stroke", "black")
            .attr("fill", "white")
            .attr("fill-opacity", 0);

        let masked_low_lineFunc = d3.line()
            .curve(d3.curveBasis)
            .x((d, i) => {
                return this.x_axis(i);
            })
            .y((d) => {
                return this.y_axis_negative(d.min);
            });

        this.chart.append("path")
            .attr("d", masked_low_lineFunc(this.resiliencydata.maskedBoundary))
            .attr("stroke", "black")
            .attr("fill", "white")
            .attr("fill-opacity", 0);

        this.chart.append('g').selectAll(".faultInjectionPoint")
            .data(this.resiliencydata.faultInjectedData)
            .enter()
            .filter((d, i) => {
                let index = Math.floor(d.File_index / 64);
                let error = +d.out_xor_relative;

                if (Math.abs(error) > 1)
                    error = Math.log(Math.abs(error)) * error / Math.abs(error)

                if (this.resiliencydata.maskedBoundary[index] == "undefined")
                    return false;

                let flag = error < this.resiliencydata.maskedBoundary[index].max &&
                    error > this.resiliencydata.maskedBoundary[index].min;
                return d.outcome != "DUE" && flag && d.outcome != "SDC"; // && d.diffnormr > 1;
            })
            .append('circle')
            .attr("cx", (d, i) => {
                return this.x_axis(Math.floor(d.File_index / 64));
            })
            .attr("cy", (d) => {
                let error = +d.out_xor_relative;
                if (Math.abs(error) > 1)
                    error = Math.log(Math.abs(error)) * error / Math.abs(error)

                if (error >= 0)
                    return this.y_axis_positive(error);
                else
                    return this.y_axis_negative(error);
            })
            .attr("r", this.circle_r)
            .attr("fill", (d) => {
                return this.outcome_color[d.outcome];
            })
            .attr("fill-opacity", 0.8)
            .on("mouseover", function (d, i) {
                console.log(d.diffnormr);
                d3.select(this).attr("r", 10);
                let json = {
                    "index": d.File_index,
                    "dataset": $("#program_TreeView_file_selector").val(),
                    "type": "resilency_single_run"
                };
                fetchResiliencySimulationData(json);
            })
            .on("mouseout", function (d, i) {
                d3.select(this).attr("r", 4);
            });
    }

    brushEvent() {

        if (d3.event.selection == null)
            return;

        let x1 = d3.min(d3.event.selection);
        let x2 = d3.max(d3.event.selection);

        let first_index = Math.ceil(this.x_axis.invert(x1));
        let second_index = Math.floor(this.x_axis.invert(x2));

        //call the server to fetch masked case boundary
        let dataset = $("#program_TreeView_file_selector").val();
        let data_info = {
            "type": "masked_boundary",
            "first": first_index,
            "second": second_index,
            "dataset": dataset
        };
        fetch_data(data_info);
    }

    updateChart(msg, data) {
        console.log(msg)
        this.resiliencydata.maskedBoundary = data;
        this.draw();
    }

    resiliency_single_simulation(msg, data) {
        console.log(msg);
        let masked_lineFunc = d3.line()
            .curve(d3.curveBasis)
            .x((d, i) => {
                return this.x_axis(i);
            })
            .y((d) => {
                return d > 0 ? this.y_axis_positive(d) : this.y_axis_negative(d);
            });

        this.single_simulation_line.html("");

        this.single_simulation_line.append("path")
            .attr("d", masked_lineFunc(data))
            .attr("stroke", "red")
            .attr("fill", "white")
            .attr("fill-opacity", 0);
    }

    setGoldenRunData(msg, data) {
        this.resiliencydata.setGoldenRun(data);
        console.log(msg + " in Resiliency View.");
    }

    setData(msg, data) {
        this.resiliencydata.setFaultInjectData(data);
        let dataset = $("#program_TreeView_file_selector").val();
        fetchGoldenSimulationData(dataset)

        console.log(msg + " in Resiliency View.");
        this.init();
    }

    addMultipleSimulation(msg, data) {
        this.resiliencydata.addSimulations(data);
        this.draw();
    }
}