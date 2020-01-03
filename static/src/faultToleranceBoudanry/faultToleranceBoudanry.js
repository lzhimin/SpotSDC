class FaultToleranceBoudanryView extends BasicView {
    /**
     * A potential reference link for visual analysis
     * https: //bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172
     */
    constructor(container) {
        super(container);

        this.faultToleranceBoudanryData = new FaultToleranceBoudanryData();
        this.dynamicInstructionIndex = 140;
        this.number_of_sample_generate_boundary = 64;
        this.circle_r = 4;
        this.fault_tolerance_boundary_truncation_background_height = 40;
        this.outcome_color = {
            'DUE': '#542788',
            'Masked': '#1b9e77',
            'SDC': '#d95f02'
        };

        this.truncation_line_display = false;
        this.mini_numerical_boundary_height = 150;
    }

    init() {
        super.init();
        this.margin = {
            'left': 150,
            'bottom': 100,
            'right': 10,
            'top': 150
        };

        //clean svg
        d3.select('#fault_tolerance_boundary_view').html('');
        this.chart = d3.select('#fault_tolerance_boundary_view')
            .append('svg')
            .attr("id", "resiliencySvg")
            .attr('width', this.width)
            .attr('height', this.height);

        let dataset = $("#program_TreeView_file_selector").val();
        let data_info = {
            "type": "masked_boundary",
            "first": 1,
            "second": 2,
            "dataset": dataset
        };

        //display interaction menu
        d3.select("#fault_tolerance_boundary_view_panel").style("visibility", "visible");

        fetchGoldenSimulationData(dataset)
        fetchMultipleSimulationData(data_info);
    }

    draw() {
        //clean the vis board
        this.chart.html("");
        this.sensitivity_area = undefined;
        this.draw_mini_numerical_boundary();
        this.draw_zoom_in_numerical_boundary();
    }



    //A gradient base selection in the threshold axis.
    //the display of the truncation line.
    //look at the shoestring.
    draw_zoom_in_numerical_boundary() {
        this.zoom_in_x_axis = d3.scaleLinear()
            .domain([0, this.faultToleranceBoudanryData.goldenrun.length])
            .range([this.margin.left, this.width - this.margin.left - this.margin.right]);

        this.chart_zoom_in_axis_x = this.chart.append('g').attr('class', 'resiliency_axis')
            .attr("transform", "translate(0," + (this.height - this.margin.bottom - this.margin.top) / 2 + ")")
            .call(d3.axisBottom(this.zoom_in_x_axis).ticks(20));

        this.zoom_in_y_axis = d3.scaleLinear().domain([this.faultToleranceBoudanryData.getSampleMax(), 0])
            .range([this.margin.top, (this.height - this.margin.bottom - this.margin.top) / 2])
            .clamp(true);

        this.chart_zoom_in_axis_y = this.chart.append('g')
            .attr("id", "chart_zoom_in_axis_y")
            .attr('class', 'resiliency_axis')
            .attr("transform", "translate(" + (this.margin.left - 5) + ", 0)")
            .call(d3.axisLeft(this.zoom_in_y_axis).ticks(10));

        d3.select('#fault_tolerance_boundary_view_percentage_block')
            .style('position', 'absolute')
            .style("left", this.margin.left - 30)
            .style("top", this.margin.top);

        this.zoom_in_masked_up_lineFunc = d3.line()
            .curve(d3.curveBasis)
            .x((d, i) => {
                return this.zoom_in_x_axis(i);
            })
            .y((d) => {
                return this.zoom_in_y_axis(d);
            });

        this.zoom_in_fault_tolerance_boundary = this.chart.append("path")
            .attr("d", this.zoom_in_masked_up_lineFunc(this.faultToleranceBoudanryData.faultToleranceBoundaryRelative))
            .attr("stroke", "steelblue")
            .attr("fill", "white")
            .attr("fill-opacity", 0)
            .style("pointer-events", "none");
        //slider 
        const threshold_axis = d3.scaleLog()
            .domain(this.faultToleranceBoudanryData.getMaxMinDiff())
            .range([(this.width - this.margin.left - this.margin.right) / 2, this.width - this.margin.left - this.margin.right])
            .clamp(true);

        this.chart.append("g")
            .attr('class', 'threshold_axis_class')
            .attr('transform', "translate(0," + (this.margin.top / 2) + ")")
            .call(d3.axisBottom(threshold_axis).ticks(10));

        this.chart.append("text")
            .attr("y", this.margin.top / 4)
            .attr("x", (this.width - this.margin.left - this.margin.right) / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("vertical-align", "middle")
            .text("SDC threshold");

        //brush event
        let analysis_option = $("#fault_tolerance_boundary_analysis_mod").val();
        /*if (analysis_option == "Sensitivity Analysis") {

            let g = this.chart.append('g');
            g.append('rect')
                .attr("width", 80)
                .attr("height", 2)
                .attr("x", this.width - this.margin.right - 20)
                .attr("y", threshold_axis(this.faultToleranceBoudanryData.threshold))
                .attr("fill", "steelblue");
            g.append('text')
                .attr("y", threshold_axis(this.faultToleranceBoudanryData.threshold) - 20)
                .attr("x", this.width - this.margin.right - 20)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("vertical-align", "middle")
                .text(this.faultToleranceBoudanryData.threshold.toFixed(4));

            d3.select("#resiliencySvg").append("g").call(d3.brushX().extent([
                    [this.width - this.margin.right, this.margin.top],
                    [this.width - this.margin.right + 40, (this.height - this.margin.bottom - this.margin.top) / 2]
                ])
                .on("brush end", (i, d, node) => {
                    // The brush event near the fault tolerance boundary
                    // It makes much more sense to make sure that the selective diff is near the 
                    // domain specific threshold value.
                    const selection = d3.event.selection;
                    if (!d3.event.sourceEvent || !selection) return;

                    let y1 = d3.min(selection),
                        y2 = d3.max(selection);

                    let first_threshold = threshold_axis.invert(y1), //this.faultToleranceBoudanryData.threshold,
                        second_threshold = threshold_axis.invert(y2);

                    let first_boundary = this.faultToleranceBoudanryData.getFaultToleranceBoundary_Relative(first_threshold),
                        second_boundary = this.faultToleranceBoudanryData.getFaultToleranceBoundary_Relative(second_threshold);

                    let points = [];
                    for (let i = 0; i < first_boundary.length; i++)
                        points.push([this.x_axis(i), this.y_axis(first_boundary[i])]);
                    for (let i = second_boundary.length - 1; i > -1; i--)
                        points.push([this.x_axis(i), this.y_axis(second_boundary[i])]);

                    //clean the old area visualization
                    if (typeof this.sensitivity_area != 'undefined')
                        this.sensitivity_area
                        .transition()
                        .duration(1000)
                        .attr('d', d3.area()(points));
                    else
                        this.sensitivity_area = this.chart.append('g')
                        .append('path')
                        .attr('d', d3.area()(points))
                        .attr("stroke", "gray")
                        .attr("fill", "gray")
                        .attr("fill-opacity", 0.3)
                        .style("pointer-events", "none");;
                }));

        } else*/
        if (analysis_option == "Golden Boundary") {
            const threshold_text = this.chart.append('text')
                .attr('x', threshold_axis(this.faultToleranceBoudanryData.threshold))
                .attr('y', this.margin.top / 2)
                .text(this.faultToleranceBoudanryData.threshold.toFixed(4))
                .style('color', "steelblue");

            const rect_width = 10,
                rect_height = 50;
            const rect = this.chart.append('rect')
                .attr("width", rect_width)
                .attr('height', rect_height)
                .attr('x', threshold_axis(this.faultToleranceBoudanryData.threshold))
                .attr('y', this.margin.top / 2 - rect_height / 2)
                .style("cursor", "grab")
                .style("fill-opacity", 0)
                .style("stroke", "steelblue")
                .style("stroke-width", "2px")
                .call(d3.drag()
                    .on("drag", () => {
                        let x = d3.event.x;
                        x = x < (this.width - this.margin.left - this.margin.right) / 2 ? (this.width - this.margin.left - this.margin.right) / 2 : x;
                        x = x > this.width - this.margin.left - this.margin.right ? this.width - this.margin.left - this.margin.right : x;
                        this.faultToleranceBoudanryData.threshold = threshold_axis.invert(x);
                        rect.attr('x', x);
                        threshold_text.attr('x', x).text(this.faultToleranceBoudanryData.threshold.toFixed(6));
                    })
                    .on("end", () => {
                        let x = d3.event.x;
                        x = x < (this.width - this.margin.left - this.margin.right) / 2 ? (this.width - this.margin.left - this.margin.right) / 2 : x;
                        x = x > this.width - this.margin.left - this.margin.right ? this.width - this.margin.left - this.margin.right : x;
                        this.faultToleranceBoudanryData.threshold = threshold_axis.invert(x);
                        this.faultToleranceBoudanryData.updateFaultToleranceBoundary();
                        rect.attr('x', x);
                        threshold_text.attr('x', x).text(this.faultToleranceBoudanryData.threshold.toFixed(6));

                        publish("THRESHOLD_CHANGE_EVENT", this.faultToleranceBoudanryData.threshold);

                        this.zoom_in_fault_tolerance_boundary
                            .transition()
                            .duration(1000)
                            .attr("d", this.zoom_in_masked_up_lineFunc(this.faultToleranceBoudanryData.faultToleranceBoundaryRelative))
                        this.fault_tolerance_boundary
                            .transition()
                            .duration(1000)
                            .attr("d", this.masked_up_lineFunc(this.faultToleranceBoudanryData.faultToleranceBoundaryRelative));
                    })
                );
        }
        //}

        //whether the user want to use truncation line to indicate the more sensitive or less sensitive location.
        /*if (this.truncation_line_display) {
            this.fault_tolerance_boundary_truncation_error = this.y_axis.domain()[0];
            this.fault_tolerance_boundary_truncation_background = this.chart.append('rect')
                .attr("x", this.margin.left)
                .attr("y", this.margin.top - this.fault_tolerance_boundary_truncation_background_height / 2)
                .attr('width', this.width - 2 * this.margin.left - this.margin.right)
                .attr("height", this.fault_tolerance_boundary_truncation_background_height)
                .style("stroke-width", "2px")
                .style("fill", "steelblue")
                .style("fill-opacity", 0.05)
                .call(d3.drag()
                    .on("drag end", () => {
                        let y = d3.event.y;
                        let top = this.margin.top - this.fault_tolerance_boundary_truncation_background_height / 2;
                        let bottom = (this.height - this.margin.bottom - this.margin.top) / 2 + -this.fault_tolerance_boundary_truncation_background_height / 2;
                        y = y < top ? top : y;
                        y = y > bottom ? bottom : y;
                        this.fault_tolerance_boundary_truncation_background.attr("y", y);
                        this.fault_tolerance_boundary_truncation_line.attr("y", y + this.fault_tolerance_boundary_truncation_background_height / 2);
                        this.fault_tolerance_boundary_truncation_error = this.y_axis.invert(y + this.fault_tolerance_boundary_truncation_background_height / 2);
                        /*this.fault_tolerance_occupation_dot
                            .attr('r', (d, i) => {
                                if (this.faultToleranceBoudanryData.faultToleranceBoundaryRelative[i] < this.fault_tolerance_boundary_truncation_error) {
                                    return 10;
                                } else {
                                    return 3;
                                }
                            })
                            .style('fill', (d, i) => {
                                if (this.faultToleranceBoudanryData.faultToleranceBoundaryRelative[i] < this.fault_tolerance_boundary_truncation_error) {
                                    return "#ad0000";
                                } else {
                                    return "steelblue";
                                }
                            })
                            .style("fill-opacity", (d, i) => {
                                if (this.faultToleranceBoudanryData.faultToleranceBoundaryRelative[i] < this.fault_tolerance_boundary_truncation_error) {
                                    return 0.9;
                                } else {
                                    return 0;
                                }
                            });*/
        /*})
                );;

            this.fault_tolerance_boundary_truncation_line = this.chart.append('rect')
                .attr("x", this.margin.left)
                .attr("y", this.margin.top)
                .attr('width', this.width - 2 * this.margin.left - this.margin.right)
                .attr("height", 3)
                .attr("fill", 'orange')
                .style("pointer-events", "none");
        }*/
    }

    draw_mini_numerical_boundary() {
        this.x_axis = d3.scaleLinear()
            .domain([0, this.faultToleranceBoudanryData.goldenrun.length])
            .range([this.margin.left, this.width - this.margin.left - this.margin.right]);

        this.mini_boundary_axis_x = this.chart.append('g').attr('class', 'resiliency_axis')
            .attr("transform", "translate(0," + ((this.height - this.margin.bottom - this.margin.top) / 2 + this.mini_numerical_boundary_height) + ")")
            .call(d3.axisBottom(this.x_axis).ticks(20));

        //menu text
        const menu_text = this.chart.append('g');
        menu_text.append("text")
            .attr("y", (this.height - this.margin.bottom - this.margin.top) / 2 + 20 + this.mini_numerical_boundary_height)
            .attr("x", (this.width - this.margin.left - this.margin.right) / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("time step");

        menu_text.append("text")
            .attr("y", (this.height - this.margin.bottom - this.margin.top) / 2 + this.mini_numerical_boundary_height / 2)
            .attr("x", this.margin.left - 50)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("writing-mode", "vertical-rl")
            .style("vertical-align", "middle")
            .text("relative error (log10)");

        this.y_axis = d3.scaleLinear().domain([this.faultToleranceBoudanryData.getSampleMax(), 0])
            .range([(this.height - this.margin.bottom - this.margin.top) / 2 + 40,
                (this.height - this.margin.bottom - this.margin.top) / 2 + this.mini_numerical_boundary_height
            ])
            .clamp(true);

        this.mini_boundary_axis_y = this.chart.append('g')
            .attr("id", "chart_axis_y")
            .attr('class', 'resiliency_axis')
            .attr("transform", "translate(" + (this.margin.left - 5) + ", 0)")
            .call(d3.axisLeft(this.y_axis).ticks(5));

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
            .attr("fill-opacity", 0)
            .style("pointer-events", "none");

        const mini_boundary_brush = d3.brushX()
            .extent([
                [this.margin.left, (this.height - this.margin.bottom - this.margin.top) / 2 + 40],
                [this.width - this.margin.left - this.margin.right, (this.height - this.margin.bottom - this.margin.top) / 2 + this.mini_numerical_boundary_height]
            ])
            .on("brush end", (i, d, node) => {
                //update the select boundary view
                const selection = d3.event.selection;
                if (!d3.event.sourceEvent || !selection) return;

                let x1 = d3.min(selection),
                    x2 = d3.max(selection);

                this.select_index1 = Math.floor(this.x_axis.invert(x1)), //this.faultToleranceBoudanryData.threshold,
                    this.select_index2 = Math.floor(this.x_axis.invert(x2));

                this.zoom_in_x_axis.domain([this.select_index1, this.select_index2]);
                this.chart_zoom_in_axis_x
                    .transition()
                    .duration(1000)
                    .call(d3.axisBottom(this.zoom_in_x_axis).ticks(20));

                this.zoom_in_masked_up_lineFunc.x((d, i) => {
                    return this.zoom_in_x_axis(i + this.select_index1);
                });

                const selectRegionData = [];
                for (let i = this.select_index1; i <= this.select_index2; i++)
                    selectRegionData.push(this.faultToleranceBoudanryData.faultToleranceBoundaryRelative[i]);

                this.zoom_in_fault_tolerance_boundary
                    .attr("d", this.zoom_in_masked_up_lineFunc(selectRegionData));
            });

        d3.select("#resiliencySvg").append("g").call(mini_boundary_brush);
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
            .attr('r', 1)
            .attr('cx', (d, i) => {
                return this.x_axis(i);
            })
            .attr("cy", (d, i) => {
                return this.text_axis_y(linenum.indexOf(d.linenum));
            })
            .style("fill", "steelblue")
            .on('mouseover', function (d) {
                d3.select(this).attr('r', 10);
                publish('SOURCECODE_HIGHLIGHT', {
                    'line': d.linenum
                });
            })
            .on('mouseout', function (d) {
                d3.select(this).attr('r', 10);
            });

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
            d3.select("#chart_axis_y")
                .transition()
                .duration(1000)
                .call(d3.axisLeft(this.y_axis).ticks(10));
            this.fault_tolerance_boundary
                .transition()
                .duration(1000)
                .attr("d", this.masked_up_lineFunc(this.faultToleranceBoudanryData.faultToleranceBoundaryRelative));
        });

        //whether the truncation line will be displayed.
        $('#fault_tolerance_truncation_line').on("change", () => {
            this.truncation_line_display = document.getElementById("fault_tolerance_truncation_line").checked;
            this.draw();
        });

        //option change event
        $("#fault_tolerance_boundary_analysis_mod").on("change", () => {
            this.draw();
        });
    }
}