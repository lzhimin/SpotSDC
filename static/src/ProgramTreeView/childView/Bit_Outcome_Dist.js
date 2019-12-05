class Bit_Outcome_Dist extends standardChildView {

    constructor(svg, x, y, width, height, data) {
        super(svg, x, y, width, height, data);

        this.bit = 64;

        this.categories_label = ['M', 'S', 'D'];

        this.outcome_categories = 3;

        this.col = this.bit;

        this.row = this.outcome_categories;

        this.rect_w = this.width / this.bit;

        this.rect_h = this.height;

        this.thresholdvalue = 0.07;

        subscribe("THRESHOLD_CHANGE_EVENT", this.thresholdvalue_change.bind(this));

    }

    clear() {
        if (this.g != undefined) {
            this.g.remove();
            this.g = undefined;
        }
    }

    draw() {
        this.histogram2d();

        this.clear();

        if (this.g == undefined)
            this.g = this.svg.append('g');

        //background rect
        this.g.append('rect')
            .attr('x', this.x)
            .attr('y', this.y)
            .attr('width', this.width)
            .attr('height', this.height)
            .classed('Bit_outcome_heatmap_background_rect', true);

        for (let index = 0; index < this.hist2d.length; index++) {
            let h_temp = 0;
            this.g.selectAll('.Bit_outcome_heatmap_' + this.uuid + '_rect' + index).data(this.hist2d[index]).enter()
                .append('rect')
                .attr('width', this.rect_w)
                .attr('height', (d, i) => {
                    if (d3.sum(this.hist2d[index], (d) => {
                            return d.length;
                        }) == 0)
                        return 0;
                    else
                        return this.rect_h * this.hist2d[index][i].length / d3.sum(this.hist2d[index], (d) => {
                            return d.length;
                        });
                })
                .attr('x', (d, i) => {
                    return this.x + this.rect_w * (this.hist2d.length - index - 1);
                })
                .attr('y', (d, i) => {
                    if (d3.sum(this.hist2d[index], (d) => {
                            return d.length;
                        }) == 0) {
                        h_temp += 0;
                        return this.y + h_temp
                    } else {
                        h_temp += this.rect_h * this.hist2d[index][i].length / d3.sum(this.hist2d[index], (d) => {
                            return d.length;
                        });
                        return this.y + h_temp - this.rect_h * this.hist2d[index][i].length / d3.sum(this.hist2d[index], (d) => {
                            return d.length;
                        });
                    }
                })
                .style('fill', (d, i) => {
                    switch (i) {
                        case 0:
                            return this.color['DUE'];
                        case 1:
                            return this.color['SDC'];
                        case 2:
                            return this.color['Masked'];
                    }
                })
                .on('click', (d, i) => {
                    publish('SUBSETDATA', d);
                });
        }

        //draw dash line for sign bit, exponent bit and mantissa bit
        let dashline_d = [
            [this.x + this.rect_w, this.y, this.x + this.rect_w, this.y + this.height],
            [this.x + this.rect_w * 12, this.y, this.x + this.rect_w * 12, this.y + this.height]
        ];

        this.g.selectAll('.HeatMap2d_' + this.uuid + '_dashLine_x').data(dashline_d).enter()
            .append('line')
            .attr('x1', d => d[0])
            .attr('y1', d => d[1])
            .attr('x2', d => d[2])
            .attr('y2', d => d[3])
            .style('stroke', 'black')
            .style('stroke-width', '1px')
            .style('stroke-opacity', 1)
            .style('stroke-dasharray', '5,5');

        this.chart_axis = d3.scaleLinear().domain([0, 1]).range([this.rect_h, 0]);
        this.chart_axis_annotation = this.g.append('g')
            .attr('class', 'bitbarchart_axis')
            .attr("transform", "translate(" + (this.x) + "," + this.y + ")")
            .call(d3.axisLeft(this.chart_axis).ticks(2));
    }

    setOutcomeColor(color) {
        this.color = color;
    }

    thresholdvalue_change(msg, value) {
        this.thresholdvalue = value;
        this.draw();
    }
    histogram2d() {

        let hist2d = [];
        for (let i = 0; i < this.bit; i++) {
            hist2d.push([
                [],
                [],
                []
            ]);
        }

        let bit = 0,
            outcome_menu = {
                'Crash': 0,
                'SDC': 1,
                'Masked': 2
            };

        this.data.values.forEach(element => {
            element.values.forEach(e => {
                let bit = parseInt(e.bit) - 1,
                    outcome = e.outcome;

                if (outcome == 'DUE') outcome = "Crash";
                else if (e.diffnormr >= this.thresholdvalue) outcome = "SDC";
                else outcome = "Masked";

                hist2d[bit][outcome_menu[outcome]].push(e);
            });
        });
        let hist = [];
        for (let j = 0; j < hist2d[0].length; j++) {
            for (let i = this.bit - 1; i > -1; i--) {
                hist.push(hist2d[i][j]);
            }
        }
        this.hist = hist;
        this.hist2d = hist2d;
    }
}