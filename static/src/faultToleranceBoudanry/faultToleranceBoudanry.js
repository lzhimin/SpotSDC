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
    }

    init() {
        super.init();
        this.margin = {
            'left': 250,
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
        //clean the vis board
        this.chart.html("");
        this.draw_numerical_boundary();
        this.draw_boundary_occupation();
    }

    //Indicate the truncation location as color.
    //Add a threshold line to indicate the location that is bad or good. (This is one of the domain requirement.)
    //A gradient base selection in the threshold axis.
    //get a better fault tolerance boundary by using linear approximation method.
    draw_numerical_boundary() {
        this.x_axis = d3.scaleLinear()
            .domain([0, this.faultToleranceBoudanryData.goldenrun.length])
            .range([this.margin.left, this.width - this.margin.left - this.margin.right]);

        this.chart_axis_x = this.chart.append('g').attr('class', 'resiliency_axis')
            .attr("transform", "translate(0," + (this.height - this.margin.bottom - this.margin.top) / 2 + ")")
            .call(d3.axisBottom(this.x_axis).ticks(20));

        this.chart.append("text")
            .attr("y", (this.height - this.margin.bottom - this.margin.top) / 2 + 20)
            .attr("x", (this.width - this.margin.left - this.margin.right) / 2 + this.margin.left)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("time step");

        this.y_axis = d3.scaleLinear().domain([this.faultToleranceBoudanryData.getSampleMax(), 0])
            .range([this.margin.top, (this.height - this.margin.bottom - this.margin.top) / 2])
            .clamp(true);

        this.chart_axis_y = this.chart.append('g')
            .attr("id", "chart_axis_y")
            .attr('class', 'resiliency_axis')
            .attr("transform", "translate(" + (this.margin.left - 5) + ", 0)")
            .call(d3.axisLeft(this.y_axis).ticks(10));

        d3.select('#fault_tolerance_boundary_view_percentage_block')
            .style('position', 'absolute')
            .style("left", this.margin.left - 30)
            .style("top", this.margin.top);

        this.chart.append("text")
            .attr("y", this.margin.top + (this.height - this.margin.bottom - this.margin.top) / 8)
            .attr("x", this.margin.left - 50)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("writing-mode", "vertical-rl")
            .style("vertical-align", "middle")
            .text("relative error (log10)");

        //slider 
        const threshold_axis = d3.scaleLog().domain([0.000001, 100000]).range([(this.height - this.margin.bottom - this.margin.top) / 2, this.margin.top])
        this.chart.append("g")
            .attr('class', 'threshold_axis_class')
            .attr('transform', "translate(" + (this.width - this.margin.right - this.margin.left + 20) + ", 0)")
            .call(d3.axisRight(threshold_axis).ticks(10));

        const threshold_text = this.chart.append('text')
            .attr('x', this.width - this.margin.left - this.margin.right + 30)
            .attr('y', threshold_axis(this.faultToleranceBoudanryData.threshold))
            .text(this.faultToleranceBoudanryData.threshold.toFixed(4))
            .style('color', "steelblue");

        const circle = this.chart.append('circle')
            .attr("r", 10)
            .attr("cx", this.width - this.margin.left - this.margin.right + 20)
            .attr("cy", threshold_axis(this.faultToleranceBoudanryData.threshold))
            .style("cursor", "grab")
            .style("fill-opacity", 0)
            .style("stroke", "steelblue")
            .style("stroke-width", "2px")
            .call(d3.drag()
                .on("drag", () => {
                    let y = d3.event.y;
                    y = y < this.margin.top ? this.margin.top : y;
                    y = y > (this.height - this.margin.bottom - this.margin.top) / 2 ? (this.height - this.margin.bottom - this.margin.top) / 2 : y;
                    this.faultToleranceBoudanryData.threshold = threshold_axis.invert(y);
                    circle.attr('cy', y);
                    threshold_text.attr('y', y).text(this.faultToleranceBoudanryData.threshold.toFixed(6));
                })
                .on("end", () => {
                    let y = d3.event.y;
                    y = y < this.margin.top ? this.margin.top : y;
                    y = y > (this.height - this.margin.bottom - this.margin.top) / 2 ? (this.height - this.margin.bottom - this.margin.top) / 2 : y;
                    this.faultToleranceBoudanryData.threshold = threshold_axis.invert(y);
                    this.faultToleranceBoudanryData.updateFaultToleranceBoundary();
                    circle.attr('cy', y);
                    threshold_text.attr('y', y).text(this.faultToleranceBoudanryData.threshold.toFixed(6));

                    this.fault_tolerance_boundary
                        .transition()
                        .duration(1000)
                        .attr("d", this.masked_up_lineFunc(this.faultToleranceBoudanryData.faultToleranceBoundaryRelative));
                })
            );

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
            .attr("stroke", "steelblue")
            .attr("fill", "white")
            .attr("fill-opacity", 0);

        this.fault_tolerance_boundary_truncation_error = this.y_axis.domain()[0];
        this.fault_tolerance_boundary_truncation_line = this.chart.append('rect')
            .attr("x", this.margin.left)
            .attr("y", this.margin.top)
            .attr('width', this.width - 2 * this.margin.left - this.margin.right)
            .attr("height", 3)
            .attr("fill", 'orange')
            .attr("fill-opacity", 0.7)
            .call(d3.drag()
                .on("drag end", () => {
                    let y = d3.event.y;
                    y = y < this.margin.top ? this.margin.top : y;
                    y = y > (this.height - this.margin.bottom - this.margin.top) / 2 ? (this.height - this.margin.bottom - this.margin.top) / 2 : y;
                    this.fault_tolerance_boundary_truncation_line.attr('y', y);
                    this.fault_tolerance_boundary_truncation_error = this.y_axis.invert(y);

                    this.fault_tolerance_occupation_dot.style('fill', (d, i) => {
                        if (this.faultToleranceBoudanryData.faultToleranceBoundaryRelative[i] < this.fault_tolerance_boundary_truncation_error) {
                            return "#ad0000";
                        } else {
                            return "steelblue";
                        }
                    });
                })
            );
    }

    draw_boundary_occupation() {
        let linenum = this.faultToleranceBoudanryData.getExecutionLineNum();
        let padding_right = 50;
        let padding_top = 50;
        this.text_axis_y = d3.scaleLinear()
            .domain([0, linenum.length])
            .range([(this.height - this.margin.bottom - this.margin.top) / 2 + padding_top, this.height - this.margin.bottom]);

        this.fault_tolerance_occupation_dot = this.chart.append("g").selectAll(".linenum_dot").data(this.faultToleranceBoudanryData.goldenrun)
            .enter()
            .append('circle')
            .attr('r', 2)
            .attr('cx', (d, i) => {
                return this.x_axis(i);
            })
            .attr("cy", (d, i) => {
                return this.text_axis_y(linenum.indexOf(d.linenum));
            })
            .style("fill", "steelblue");

        this.chart.append("g").selectAll('.linenum_text').data(linenum).enter().append("text")
            .text((d) => d)
            .attr('x', (d, i) => {
                return this.margin.left - padding_right;
            })
            .attr('y', (d, i) => {
                return this.text_axis_y(i);
            })
            .style("text-anchor", "middle")
            .style("vertical-align", "middle");
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
        this.init_menu_option();
    }

    addMultipleSimulation(msg, data) {
        this.faultToleranceBoudanryData.addSimulations(data);
        this.draw();
    }

    init_menu_option() {
        //percentage change event
        d3.select("#fault_tolerance_boundary_view_percentage_input").on("input", () => {
            let percentage = $("#fault_tolerance_boundary_view_percentage_input").val();
            this.faultToleranceBoudanryData.setPercentage(+percentage * 0.01);

            this.y_axis.domain([this.faultToleranceBoudanryData.getSampleMax(), 0]);
            //this.chart_axis_y.call(this.y_axis);
            d3.select("#chart_axis_y")
                .transition()
                .duration(1000)
                .call(d3.axisLeft(this.y_axis).ticks(10));
            this.fault_tolerance_boundary
                .transition()
                .duration(1000)
                .attr("d", this.masked_up_lineFunc(this.faultToleranceBoudanryData.faultToleranceBoundaryRelative));
        });

        //truncation line

    }
}