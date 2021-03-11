class ProgramTreeView extends BasicView {

    constructor(container) {
        super(container);
        this.programtreedata = new ProgramTreeData();
        this.programtreecontroller = new ProgramViewController();

        this.outcome_color = {
            'DUE': '#542788',
            'Crash': '#542788',
            'Masked': '#1b9e77',
            'SDC': '#d95f02'
        }

        this.colorscale = ['#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'];

        this.viewoption = 'bit_outcome_dist';

        this.normalization_global = false;

        this.collapse_node = new Set();

        //register event
        subscribe('RESAMPLE', this.Resample.bind(this));
    }

    init() {
        super.init();

        this.blockw = 60;
        this.blockh = 50;

        this.top_padding = this.y = 200;
        this.left_padding = this.x = 20;
        this.padding = 40;
        this.bottom_padding = 15;

        this.padding_between_bit_stack = 20;
        this.bitmap_width = 500;
        this.stackbar_width = 300;

        //bit outcome distribution
        this.bit_Outcome_Dist_bucket = {};
        this.bit_Sample_Dist_bucket = {};

        this.stackbar_bucket = {};
        this.impact_heatmap_bucket = {};
        this.value_heatmap_bucket = {};

        this.valueStack_bucket = {};
        this.SDC_Impact_dist_bucket = {};

        //clean svg
        d3.select('#ProgramTreeViewCanvas').html('');
        this.svg = d3.select('#ProgramTreeViewCanvas').append('svg')
            .attr('width', this.width)
            .attr('height', this.height + 80);
    }

    draw() {

        this.init();
        //reset all the content on canvas
        this.draw_summary();
        this.draw_tree();

        this.draw_menu();
        this.draw_annotation();

    }

    draw_summary() {
        let x = this.left_padding + this.blockw * 4;
        let y = this.top_padding;

        this.draw_leaf_vis(x, y, this.programtreedata.getSummaryData(), "data_summary");
        //draw axis?
        if (this.viewoption == 'bit_outcome_dist' || this.viewoption == 'bit_sample_dist') {
            let chart_axis = d3.scaleLinear().domain([64, 1]).range([x, x + this.bitmap_width - 5]);
            this.summary_bit_axis = this.svg.append('g')
                .attr('class', 'bitbarchart_axis')
                .attr("transform", "translate(" + (this.left_padding * 2) + ',' + (y + this.blockh - 8) + ")")
                .call(d3.axisBottom(chart_axis).ticks(16));
        }
    }

    draw_tree() {
        let hierachicaldata = this.programtreedata.getHierachicalData();
        let x = this.left_padding,
            y = this.top_padding + 80,
            h = 0;
        let padding = 3;

        hierachicaldata.values.sort(function (a, b) {
            return a.key > b.key;
        });

        if (this.is_the_node_a_leaf(hierachicaldata)) {
            hierachicaldata.values.forEach((d, index) => {
                h += this.draw_inner_node(20 + this.blockw, y + h, d, hierachicaldata.key);
                h += padding;
            });
        } else {
            h += this.blockh;
            this.draw_leaf_vis(x + this.blockw * 2 + this.padding, y, hierachicaldata);
        }

        //if the current svg is smaller than the current size of tree
        if (this.height < this.top_padding + h + this.bottom_padding + 80) {
            this.svg.attr('height', this.top_padding + h + this.bottom_padding + 80);
        }

        this.draw_node(x, y, h - padding, this.blockw, hierachicaldata);
    }

    draw_inner_node(x, y, data, parent) {

        let height_of_current_node = 0;
        //fix the order
        data.values.sort(function (a, b) {
            return a.key > b.key;
        });

        if (this.is_the_node_a_leaf(data) && !this.collapse_node.has(data.key)) {
            //recursive draw the tree node
            data.values.forEach((d, index) => {
                height_of_current_node += this.draw_inner_node(x + this.blockw, y + height_of_current_node, d, parent + '_' + data.key);
            });
        } else {
            if (this.collapse_node.has(data.key)) {
                height_of_current_node = this.blockh;
                let rs = this.hierachy_aggregation(data);
                rs = d3.nest().key(function (d) {
                    return d.outcome
                }).sortKeys(d3.ascending).entries(rs);

                let item = {
                    'key': data.key
                };
                item['values'] = rs;

                this.draw_leaf_vis(this.left_padding + this.blockw * 4, y, item, data.key);
            } else {
                height_of_current_node = this.blockh;
                this.draw_leaf_vis(x + this.blockw + this.padding, y, data, parent + '_' + data.key);
            }
        }
        this.draw_node(x, y, height_of_current_node, this.blockw, data);
        return height_of_current_node;
    }

    draw_node(x, y, h, w, d) {
        this.svg.selectAll('.treenode_' + d.key).data([d]).enter().append('rect')
            .attr('width', w)
            .attr('height', h)
            .attr('x', x)
            .attr('y', y)
            .attr('rx', 5)
            .attr('ry', 5)
            .on('click', (data, i, node) => {
                let isnum = /^\d+$/.test(data.key);
                if (isnum) {
                    d3.selectAll('.tree_node')
                        .classed('tree_node', true)
                        .classed('tree_node_highlight', false);

                    d3.select(node[0]).classed('tree_node_highlight', true);
                    publish('SOURCECODE_HIGHLIGHT', {
                        'line': data.key,
                        'function': this.programtreedata.getFunctionName(data.key)
                    });

                    publish('SUBSETDATA', this.hierachy_aggregation(data));
                } else {
                    //collapse or expand operation
                    if (this.collapse_node.has(data.key)) {
                        this.collapse_node.delete(data.key);
                    } else {
                        this.collapse_node.add(data.key);
                    }
                    this.draw();
                }
            })
            .attr('class', (d) => {
                return this.collapse_node.has(d.key) ? "tree_node_collapse" : "tree_node";
            });

        this.svg.selectAll('.treetext_' + d.key).data([d]).enter().append('text')
            .text(d => d.key)
            .attr('x', (d, i) => {
                return x + w / 2;
            })
            .attr('y', (d, i) => {
                return y + h / 2;
            })
            .classed('programTreeView_text', true)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('font-size', (d, i, node) => {
                let labelWidth = node[i].getComputedTextLength();
                if (labelWidth < this.blockw) {
                    return null;
                }
                return ((this.blockw - 4) / labelWidth) + 'em';
            })
            .style('pointer-events', 'none');
    }

    draw_leaf_vis(x, y, data, parent) {

        x = this.left_padding + this.blockw * 4 + this.padding;

        this.stackbar_bucket[parent + '_' + data.key] = new StackBarChart(this.svg, x + this.bitmap_width + this.padding_between_bit_stack, y, this.stackbar_width, this.blockh, data, this.programtreedata.thresholdValue);
        this.stackbar_bucket[parent + '_' + data.key].setOutcomeColor(this.outcome_color);
        this.stackbar_bucket[parent + '_' + data.key].draw();
        this.stackbar_bucket[parent + '_' + data.key].setGlobalFlag(this.normalization_global);

        this.value_heatmap_bucket[parent + '_' + data.key] = new ValueHeatMap(this.svg, x, y, this.bitmap_width, this.blockh, data, this.programtreedata.getMaxInput(), this.programtreedata.getMinInput(), this.programtreedata.thresholdValue);
        this.value_heatmap_bucket[parent + '_' + data.key].setColor(this.colorscale);

        this.impact_heatmap_bucket[parent + '_' + data.key] = new ImpactHeatmap(this.svg, x, y, this.bitmap_width, this.blockh, data, this.programtreedata.getMaxDiff(), this.programtreedata.getMinDiff(), this.programtreedata.thresholdValue);
        this.impact_heatmap_bucket[parent + '_' + data.key].setOutcomeColor(this.colorscale);

        this.SDC_Impact_dist_bucket[parent + '_' + data.key] = new SDCImpactDistribution(this.svg, x, y, this.bitmap_width, this.blockh, data, this.programtreedata.getMaxSDCImpact(), this.programtreedata.getMinSDCImpact(), this.programtreedata.thresholdValue);
        this.SDC_Impact_dist_bucket[parent + '_' + data.key].setOutcomeColor(this.colorscale);

        this.bit_Outcome_Dist_bucket[parent + '_' + data.key] = new Bit_Outcome_Dist(this.svg, x, y, this.bitmap_width, this.blockh, data, this.programtreedata.thresholdValue);
        this.bit_Outcome_Dist_bucket[parent + '_' + data.key].setOutcomeColor(this.outcome_color);

        this.bit_Sample_Dist_bucket[parent + '_' + data.key] = new Bit_Sample_Dist(this.svg, x, y, this.bitmap_width, this.blockh, data, this.programtreedata.getLowestProblemBit(), this.programtreedata.thresholdValue);
        this.bit_Sample_Dist_bucket[parent + '_' + data.key].setOutcomeColor(this.outcome_color);

        this.valueStack_bucket[parent + '_' + data.key] = new valueStack(this.svg, x, y, this.bitmap_width, this.blockh, data, this.programtreedata.getMaxDiff(), this.programtreedata.getMinDiff(), this.programtreedata.thresholdValue)
        this.valueStack_bucket[parent + '_' + data.key].setOutcomeColor(this.outcome_color);

        
        if (this.viewoption == 'bit_outcome_dist')
            this.bit_Outcome_Dist_bucket[parent + '_' + data.key].draw();
        else if (this.viewoption == 'error_output_dist')
            this.impact_heatmap_bucket[parent + '_' + data.key].draw();
        else if (this.viewoption == 'value_heatmap')
            this.value_heatmap_bucket[parent + '_' + data.key].draw();
        else if (this.viewoption == 'value_stackChart')
            this.valueStack_bucket[parent + '_' + data.key].draw();
        else if (this.viewoption == "SDC_impact_dist")
            this.SDC_Impact_dist_bucket[parent + '_' + data.key].draw();
        else if (this.viewoption == "bit_sample_dist")
            this.bit_Sample_Dist_bucket[parent + '_' + data.key].draw();
    }

    draw_menu() {

        //let x = this.x + this.programtreedata.getTreeHeight() * this.blockw + this.left_padding;
        let x = this.left_padding + this.blockw * 4 + this.padding;
        //let y = 100;

        //draw tree menu
        d3.select('#ProgramTree_Tree_Menu')
            .style('display', 'block')
            .style('position', 'absolute')
            .style('top', this.top_padding + $('#ProgramTreeViewMenu').height() + 60)
            .style('left', this.left_padding + this.blockw);

        //draw sort option memu
        d3.select("#ProgramTree_sort_option_menu")
            .style('display', 'block')
            .style('position', 'absolute')
            .style('top', $('#ProgramTreeViewMenu').height() + 10)
            .style('left', this.left_padding);

        d3.selectAll('.tree_attribute').style('width', this.blockw - 3);

        //draw distribution chart menu
        d3.select('#ProgramTree_impact_chart_menu')
            .style('display', 'block')
            .style('position', 'absolute')
            .style('top', $('#ProgramTreeViewMenu').height() + 10)
            .style('left', x);

        //draw ratio 
        d3.select('#ProgramTree_ratio_chart_menu')
            .style('display', 'block')
            .style('position', 'absolute')
            .style('top', $('#ProgramTreeViewMenu').height() + 10)
            .style('left', x + this.bitmap_width + this.padding_between_bit_stack);
    }

    draw_annotation(x, y) {
        this.draw_annotation_heatmap(x, y);
        this.draw_summary_annotation(x, y);
        this.draw_annotation_stackchart(x, y);
    }

    draw_summary_annotation(x, y) {
        let g = this.svg.append('g');

        g.append("text").text("Fault Injection Summary")
            .attr('x', (d, i) => {
                return this.left_padding + this.padding * 1.5 + this.blockw;
            })
            .attr('y', (d, i) => {
                return this.top_padding + this.blockh / 3;
            })
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "middle")
            .style("font-size", 20);
    }

    draw_annotation_stackchart(x, y) {
        //ratio
        let ratio_chart_x = this.left_padding + this.blockw * 4 + this.padding * 1.5 + this.bitmap_width;
        this.stackbar_chart_axis = d3.scaleLinear().range([ratio_chart_x, ratio_chart_x + this.stackbar_width]).domain([0, 1]);
        this.stackbar_chart_axis_annotation = this.svg.append('g').attr('class', 'axis axis--x')
            .attr("transform", "translate(0," + (this.top_padding - 20) + ")")
            .call(d3.axisTop(this.stackbar_chart_axis).ticks(5));

        //SDC frequency
        if (this.stackbar_chart_text_above != undefined)
            this.stackbar_chart_text_above.remove();

        this.stackbar_chart_text_above = this.svg.append('g').append('text').text('SDC Ratio')
            .attr('x', (d, i) => {
                return ratio_chart_x + this.stackbar_width / 2;
            })
            .attr('y', (d, i) => {
                return this.top_padding - 45;
            })
            .attr('dominant-baseline', 'central')
            .attr('text-anchor', 'middle')
            .style('font-size', 12);
        //SDC ratio

        //category annotation
        if (this.stackbar_chart_text != undefined)
            this.stackbar_chart_text.remove();
        this.stackbar_chart_text = this.svg.append('g');

        this.stackbar_chart_text.selectAll('.stackbar_chart_text').data(Object.keys(this.outcome_color).sort().filter((d) => {
                return d != "DUE";
            }))
            .enter()
            .append('text')
            .text((d) => {
                if (d == "DUE") return "Crash";
                else return d;
            })
            .attr('x', (d, i) => {
                return ratio_chart_x + this.stackbar_width / 1.5;
            })
            .attr('y', (d, i) => {
                return this.top_padding - 180 + i * 20 + 7.5;
            })
            .attr('dominant-baseline', 'central')
            .style('font-size', 12);

        //outcome color
        if (this.stackbar_chart_rect != undefined)
            this.stackbar_chart_rect.remove();
        this.stackbar_chart_rect = this.svg.append('g');

        this.stackbar_chart_rect.selectAll('.stackbar_chart_rect').data(Object.keys(this.outcome_color).sort().filter((d) => {
                return d != "DUE";
            }))
            .enter()
            .append('rect')
            .attr('x', (d, i) => {
                return ratio_chart_x + this.stackbar_width;
            })
            .attr('y', (d, i) => {
                return this.top_padding - 180 + i * 20;
            })
            .attr('width', 15)
            .attr('height', 15)
            .style('fill', (d) => {
                return this.outcome_color[d];
            })
            .classed('tree_node', true);
    }

    draw_annotation_heatmap() {

        if (this.impactHeatmapAnnotation != undefined)
            this.impactHeatmapAnnotation.remove();

        if (this.bitHeatMapAnnotation != undefined)
            this.bitHeatMapAnnotation.remove();

        if (this.bitHeatMapAnnotation_colorscale != undefined)
            this.bitHeatMapAnnotation_colorscale.remove();

        if (this.valueImpactHeatMapAnnotation != undefined)
            this.valueImpactHeatMapAnnotation.remove();

        let colorscale = this.colorscale;
        let colorscale_w = this.bitmap_width / (2 * colorscale.length);
        let colorscale_h = 20;

        this.bitHeatMapAnnotation_colorscale = this.svg.append('g');


        this.bitHeatMapAnnotation_colorscale.selectAll('.colorscale').data(colorscale).enter()
            .append('rect')
            .attr('x', (d, i) => {
                return this.left_padding + this.blockw * 4 + this.padding * 2 + this.bitmap_width / 5 + colorscale_w * i;
            })
            .attr('y', (d, i) => {
                return this.top_padding - 85;
            })
            .attr('width', colorscale_w)
            .attr('height', colorscale_h)
            .attr('fill', (d, i) => {
                return d;
            })
	            .style('stroke', 'gray')
	            .style('stroke-width', '1px');

        this.bitHeatMapAnnotation_colorscale.selectAll('.colorscale_text').data(() => {
                let data = ['0%<'];
                for (let i = 1; i <= this.colorscale.length; i++) {
                    data.push(parseInt(100.0 / this.colorscale.length * i) + '%');
                }
                return data;
            }).enter().append('text')
            .text(d => d)
            .attr('x', (d, i) => {
                return this.left_padding + this.blockw * 4 + this.padding * 2 + this.bitmap_width / 5 + colorscale_w * i;
            })
            .attr('y', this.top_padding - 95)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('font-size', '12px')
            .style('font-weight', 'bold');

        //empty space color map
        this.bitHeatMapAnnotation_colorscale
            .append('rect')
            .attr('x', (d, i) => {
                return this.left_padding + this.blockw * 4 + this.padding * 2 + this.bitmap_width / 5 + colorscale_w * -2;
            })
            .attr('y', (d, i) => {
                return this.top_padding - 85;
            })
            .attr('width', colorscale_w)
            .attr('height', colorscale_h)
            .attr('fill', 'white')
            .style('stroke', 'gray')
            .style('stroke-width', '1px');

        this.bitHeatMapAnnotation_colorscale.append('text')
            .text('0%')
            .attr('x', (d, i) => {
                return this.left_padding + this.blockw * 4 + this.padding * 2 + this.bitmap_width / 5 + colorscale_w * -1.5;
            })
            .attr('y', this.top_padding - 95)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('font-size', '12px')
            .style('font-weight', 'bold');


        if (this.viewoption == 'bit_heatmap' || this.viewoption == 'bit_sample_dist' || this.viewoption == 'bit_outcome_dist') {

            if (this.viewoption == 'bit_outcome_dist' || this.viewoption == 'bit_sample_dist') {
                this.bitHeatMapAnnotation_colorscale.attr('display', 'none');
                this.bitHeatMapAnnotation_colorscale.attr('display', 'none');
            }

            this.bitHeatMapAnnotation = this.svg.append('g');
            this.bitHeatMapAnnotation.append('text').text(() => {
                    if (this.viewoption == 'bit_sample_dist')
                        return 'Bit Sample Distribution';
                    else
                        return 'Bit Outcome Distribution';
                })
                .attr('x', (d, i) => {
                    return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width / 2;
                })
                .attr('y', (d, i) => {
                    return this.top_padding - 40;
                })
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central");

            this.bitHeatMapAnnotation.selectAll('.programTreeViewMenu_annotation').data(['Sign', 'Exponent', 'Mantissa'])
                .enter()
                .append('text')
                .text(d => d)
                .attr('x', (d, i) => {
                    if (i == 0)
                        return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width / 128;
                    else if (i == 1)
                        return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width * 6.5 / 64;
                    else
                        return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width * 19 / 32;
                })
                .attr('y', (d, i) => {
                    return this.top_padding - 20;
                })
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central")
                .style('font-size', 12);
        } else if (this.viewoption == "error_output_dist" || this.viewoption == "SDC_impact_dist") {
            let x = this.left_padding + this.blockw * 4 + this.padding;
            let maxdiff = this.viewoption == "error_output_dist" ? this.programtreedata.getMaxDiff() : 10;
            let mindiff = this.viewoption == "error_output_dist" ? this.programtreedata.getMinDiff() : 0;
            let labeltext = this.viewoption == "error_output_dist" ? "SDC Impact Distribution(log10)" : "SDC Impact Distribution(log10)";
            let x_axis = d3.scaleLinear().range([x, x + Math.floor(this.bitmap_width / 10) * 10]).domain([mindiff, maxdiff]);

            this.impactHeatmapAnnotation = this.svg.append('g')
            this.impactHeatmapAnnotation.append('text').datum([labeltext]).text(d => d)
                .attr('x', (d, i) => {
                    return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width / 2;
                })
                .attr('y', (d, i) => {
                    return this.top_padding - 40;
                })
                .attr('text-anchor', 'middle');
            this.impactHeatmapAnnotation.append('g').attr('class', 'axis axis--x')
                .attr("transform", "translate(0," + (this.top_padding - 20) + ")")
                .call(d3.axisTop(x_axis).tickValues(d3.range(mindiff, maxdiff, (maxdiff - mindiff) / 10)));
        }
    }

    is_the_node_a_leaf(data) {        
        return 'key' in data.values[0] && !(data.values[0].key in this.outcome_color);
    }

    hierachy_aggregation(data) {
        let result = []
        if (data.key in this.outcome_color) {
            return data.values;
        }

        data.values.forEach((d) => {
            let rs = this.hierachy_aggregation(d);
            result = result.concat(rs);
        });

        return result;
    }

    setData(msg, data) {
        this.programtreedata.setData(data);
        this.callbackBinding();
        this.init();
        this.draw();
    }

    setThresholdValue(msg, value) {

        this.programtreedata.setThresholdValue(value);
    }

    callbackBinding() {
        this.programtreecontroller.bindingEvent();
        this.programtreecontroller.setNormalizationChangeCallback(this.updateStackChart.bind(this));
        this.programtreecontroller.setTreeStructureChangeCallback(this.treeStructureChangeEvent.bind(this));
        this.programtreecontroller.setfiltercalllback(this.filterData.bind(this));
        this.programtreecontroller.setViewChangeCallback(this.changeViewEvent.bind(this));
    }

    updateStackChart(option) {
        if (option == 'global') {
            this.stackbar_chart_text_above.text('The Number of Fault Injections');
            this.normalization_global = true;
            let maxsize = 0;
            for (let key in this.stackbar_bucket) {
                maxsize = Math.max(maxsize, this.stackbar_bucket[key].getExperimentCount());
            }

            for (let key in this.stackbar_bucket) {
                this.stackbar_bucket[key].setMaxDataSize(maxsize);
                this.stackbar_bucket[key].setGlobalFlag(this.normalization_global);
                this.stackbar_bucket[key].draw();
            }

            this.stackbar_chart_axis.domain([0, maxsize]);
        } else if (option == 'local') {
            this.stackbar_chart_text_above.text('SDC Ratio');
            this.normalization_global = false;
            for (let key in this.stackbar_bucket) {
                this.stackbar_bucket[key].setGlobalFlag(this.normalization_global);
                this.stackbar_bucket[key].draw();
            }
            this.stackbar_chart_axis.domain([0, 1]);
        }

        //update axis
        this.stackbar_chart_axis_annotation.transition(1500).call(d3.axisTop(this.stackbar_chart_axis).ticks(5));
    }

    treeStructureChangeEvent(pattern) {
        this.programtreedata.setHierachicalData(pattern);
        this.collapse_node = new Set();
        this.draw();
    }

    changeViewEvent(option) {

        this.viewoption = option;

        for (let key in this.bit_Outcome_Dist_bucket) {
            this.impact_heatmap_bucket[key].clear();
            this.value_heatmap_bucket[key].clear();
            this.bit_Outcome_Dist_bucket[key].clear();
            this.valueStack_bucket[key].clear();
            this.bit_Sample_Dist_bucket[key].clear();
        }

        //hidden the summary bit axis          
        this.summary_bit_axis.attr('display', 'none');

        if (option == 'error_output_dist') {
            for (let key in this.impact_heatmap_bucket) {
                this.impact_heatmap_bucket[key].draw();
            }
        } else if (option == 'value_heatmap') {
            for (let key in this.value_heatmap_bucket) {
                this.value_heatmap_bucket[key].draw();
            }
        } else if (option == 'bit_outcome_dist') {
            this.summary_bit_axis.attr("display", "block");
            for (let key in this.bit_Outcome_Dist_bucket) {
                this.bit_Outcome_Dist_bucket[key].draw();
            }
        } else if (option == 'value_stackChart') {
            for (let key in this.valueStack_bucket) {
                this.valueStack_bucket[key].draw();
            }
        } else if (option == 'bit_sample_dist') {
            this.summary_bit_axis.attr("display", "block");
            for (let key in this.bit_Sample_Dist_bucket) {
                this.bit_Sample_Dist_bucket[key].draw();
            }
        } else if (option == 'SDC_impact_dist') {
            for (let key in this.SDC_Impact_dist_bucket) {
                this.SDC_Impact_dist_bucket[key].draw();
            }
        }
        this.draw_annotation_heatmap();
    }

    filterData(category, items) {
        this.programtreedata.filterDataOperation(category, items);
        this.draw();
    }

    setSubsetSelection(msg, value) {
        this.programtreedata.filterDataOperation('interval', value);
        this.draw();
    }

    Resample(msg, data) {
        for (let i = 0; i < data.length; i++) {
            this.programtreedata.data.push(data[i]);
        }
        this.programtreedata.setData(this.programtreedata.data, this.programtreedata.pattern);
        this.draw();
    }
}