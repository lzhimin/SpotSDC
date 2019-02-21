class standardChildView{

    constructor(svg, x, y, width, height, data) {

        this.uuid = uuidv4();

        this.svg = svg;

        this.x = x;
        this.y = y;

        this.margin_top = 4;
        this.margin_bottom = 4;
        this.margin_left = 2;
        this.margin_right = 2;

        this.width = width - this.margin_left - this.margin_right;
        this.height = height - this.margin_top - this.margin_bottom;

        this.data = data;
    }


    draw(){

    }
}