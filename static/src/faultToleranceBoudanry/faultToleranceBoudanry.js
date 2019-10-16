class FaultToleranceBoudanryView extends BasicView {

    constructor(container) {
        super(container);

        this.faultToleranceBoudanryData = new FaultToleranceBoudanryData();
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
        this.margin = {
            'left': 200,
            'bottom': 200,
            'right': 50,
            'top': 100
        };

        //clean svg
        d3.select('#fault_tolerance_boundary_view').html('');
        this.chart = d3.select('#fault_tolerance_boundary_view')
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
            .domain([0, this.faultToleranceBoudanryData.goldenrun.length])
            .range([this.margin.left, this.width - this.margin.left - this.margin.right]);

        this.chart_axis_x = this.chart.append('g').attr('class', 'resiliency_axis')
            .attr("transform", "translate(0," + (this.height - this.margin.bottom - this.margin.top) + ")")
            .call(d3.axisBottom(this.x_axis).ticks(20));

        this.y_axis = d3.scaleLinear().domain([this.faultToleranceBoudanryData.getSampleMax(), 0])
            .range([this.margin.top, this.height - this.margin.bottom - this.margin.top])
            .clamp(true);

        this.chart_axis_y = this.chart.append('g').attr('class', 'resiliency_axis')
            .attr("transform", "translate(" + (this.margin.left - 5) + ", 0)")
            .call(d3.axisLeft(this.y_axis).ticks(10));

        //slider 
        this.chart.append("line")
            .attr('x1', this.width - this.margin.left - this.margin.right + 20)
            .attr('x2', this.width - this.margin.left - this.margin.right + 20)
            .attr('y1', this.margin.top)
            .attr('y2', this.height - this.margin.bottom - this.margin.top)
            .style("stroke", "steelblue")
            .style("stroke-linecap", "round")
            .style("stroke-width", 2);

        const threshold_axis = d3.scaleLinear().domain([this.height - this.margin.bottom - this.margin.top, this.margin.top]).range([0, 1])
        const circle = this.chart.append('circle')
            .attr("r", 10)
            .attr("cx", this.width - this.margin.left - this.margin.right + 20)
            .attr("cy", threshold_axis.invert(this.faultToleranceBoudanryData.threshold))
            .style("cursor", "grab")
            .style("fill", "steelblue")
            .call(d3.drag().on("end", () => {
                let y = d3.event.y;
                y = y < this.margin.top ? this.margin.top : y;
                y = y > this.height - this.margin.bottom - this.margin.top ? this.height - this.margin.bottom - this.margin.top : y;
                this.faultToleranceBoudanryData.threshold = threshold_axis(y);
                this.faultToleranceBoudanryData.updateFaultToleranceBoundary_Relative();
                circle.attr('cy', y);

                this.fault_tolerance_boundary
                    .transition()
                    .duration(1000)
                    .attr("d", this.masked_up_lineFunc(this.faultToleranceBoudanryData.faultToleranceBoundaryRelative));
            }));


        /*this.chart.append('g').selectAll(".faultInjectionPoint")
            .data(this.faultToleranceBoudanryData.samplingData)
            .enter()
            //.filter((d, i) => {})
            .append('circle')
            .attr("cx", (d, i) => {
                return this.x_axis(Math.floor(d.File_index / 64));
            })
            .attr("cy", (d) => {
                if (isNaN(+d.out_xor_relative) || !isFinite(+d.out_xor_relative)) {
                    return this.y_axis.range()[0];
                }

                return this.y_axis(this.faultToleranceBoudanryData.logFunc(Math.abs(+d.out_xor_relative)));
            })
            .attr("r", this.circle_r)
            .attr("fill", (d) => {
                return this.outcome_color[d.outcome];
            })
            .attr("fill-opacity", 0.3)
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
            })
            .on("click", function (d, i) {
                console.log(d);
                publish('SOURCECODE_HIGHLIGHT', {
                    'line': d.Line,
                    'function': d.Function
                });
            });*/

        this.masked_up_lineFunc = d3.line()
            .curve(d3.curveBasis)
            .x((d, i) => {
                return this.x_axis(i);
            })
            .y((d) => {
                return this.y_axis(d);
            });

        this.fault_tolerance_boundary = this.chart.append("path")
            .attr("d", this.masked_up_lineFunc(this.faultToleranceBoudanryData.faultToleranceBoundaryRelative))
            .attr("stroke", "black")
            .attr("fill", "white")
            .attr("fill-opacity", 0);
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
        //let data_info = {
        //    "type": "masked_boundary",
        //    "first": first_index,
        //    "second": second_index,
        //    "dataset": dataset
        //};
        //fetch_data(data_info);
    }

    updateChart(msg, data) {
        console.log(msg)
        this.faultToleranceBoudanryData.maskedBoundary = data;
        this.draw();
    }

    resiliency_single_simulation(msg, data) {
        console.log(msg);
        /*let masked_lineFunc = d3.line()
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
            .attr("fill-opacity", 0);*/
    }

    setGoldenRunData(msg, data) {
        this.faultToleranceBoudanryData.setGoldenRun(data);
        console.log(msg + " in Resiliency View.");
    }

    setData(msg, data) {
        this.faultToleranceBoudanryData.setFaultInjectData(data);
        let dataset = $("#program_TreeView_file_selector").val();
        fetchGoldenSimulationData(dataset)

        console.log(msg + " in Resiliency View.");
        this.init();
    }

    addMultipleSimulation(msg, data) {
        this.faultToleranceBoudanryData.addSimulations(data);
        this.draw();
    }
}