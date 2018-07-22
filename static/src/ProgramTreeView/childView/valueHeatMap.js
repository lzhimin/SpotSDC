class ValueHeatMap extends standardChildView{
    constructor(svg, x, y, width, height, data, maxDiff, minDiff){
        super(svg, x, y, width, height, data);

        this.threshold = 0.07;
        this.maxLogDiff = maxDiff;
        this.minLogDiff = minDiff;
        this.sdc_bin_size = 10;

        this.hist = this.histogram1D();
    }
}