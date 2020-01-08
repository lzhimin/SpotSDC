class valueStack extends standardChildView {

    constructor(svg, x, y, width, height, data, maxIn, minIn, threshold) {
        super(svg, x, y, width, height, data);

        this.maxLogIn = maxIn;
        this.minLogIn = minIn;
        this.bin_size = 10;
        this.col = this.bin_size + 1;
        this.row = 3;

        this.width = width;
        this.heigth = height - 2;

        this.rect_h = this.heigth;
        this.rect_w = this.width / (this.bin_size + 1);

        this.threshold = threshold;

        this.categories_label = ['M', 'S', 'D'];

    }

    clear() {
        if (this.g != undefined) {
            this.g.remove();
            this.g = undefined;
        }
    }

    draw() {
        this.hist2d = this.histogram2D();

        this.clear();

        if (this.g == undefined)
            this.g = this.svg.append('g');

        //background rect
        this.g.append('rect')
            .attr('x', this.x)
            .attr('y', this.y)
            .attr('width', this.width + 5)
            .attr('height', this.height + 2)
            .classed('value_heatmap_background_rect', true);


        for (let index = 0; index < this.hist2d.length; index++) {
            let h_temp = 0;

            if (d3.sum(this.hist2d[index], (d) => {
                    return d.length;
                }) == 0) {
                continue;
            }

            this.g.selectAll('.value_heatmap_' + this.uuid + '_rect' + index).data(this.hist2d[index]).enter()
                .append('rect')
                .attr('width', this.rect_w)
                .attr('height', (d, i) => {
                    return this.rect_h * this.hist2d[index][i].length / d3.sum(this.hist2d[index], (d) => {
                        return d.length;
                    });
                })
                .attr('x', (d, i) => {
                    if (index == 10)
                        return this.x + this.rect_w * index + 5;
                    return this.x + this.rect_w * index;
                })
                .attr('y', (d, i) => {
                    h_temp += this.rect_h * this.hist2d[index][i].length / d3.sum(this.hist2d[index], (d) => {
                        return d.length;
                    });
                    return this.y + h_temp - this.rect_h * this.hist2d[index][i].length / d3.sum(this.hist2d[index], (d) => {
                        return d.length;
                    });
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
    }

    setOutcomeColor(color) {
        this.color = color;
    }

    histogram2D() {

        let hist2d = [],
            index = 0,
            range = []
        for (let i = 0; i < this.bin_size; i++) {
            range.push(i);
        }

        let scale = d3.scaleQuantize().domain([this.minLogIn, this.maxLogIn]).range(range);

        let outcome_menu = {
            'DUE': 0,
            'SDC': 1,
            'Masked': 2
        };
        for (let i = 0; i <= this.bin_size; i++) {
            hist2d.push([
                [],
                [],
                []
            ]);
        }

        this.data.values.forEach(element => {
            element.values.forEach(e => {
                if (e.out_xor == 'nan') {
                    hist2d[this.bin_size][outcome_menu[e.outcome]].push(e);
                } else if (Math.abs(+e.out_xor) == 0) {
                    hist2d[0][outcome_menu[e.outcome]].push(e);
                } else {
                    index = scale(Math.log(Math.abs(+e.out_xor)));
                    hist2d[index][outcome_menu[e.outcome]].push(e);
                }
            });
        });

        return hist2d;
    }
}