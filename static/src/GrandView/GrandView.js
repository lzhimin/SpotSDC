class GrandView extends BasicView{
    
    constructor(container) {
        super(container);
        this.outcome_color = {
            'DUE': '#542788',
            'Masked': '#99d594',
            'SDC': '#fc8d59'
        }  


        this.top_padding = 50;
        this.left_padding = 200;
        this.right_padding = 10;
        this.y = this.top_padding;
        this.x = this.left_padding;
        this.bitsize = 64;
    }

    init(){

        super.init();

        this.grandviewdata = new GrandViewData(this.data);

        this.grandviewdata.getMaxMin_Absolute();

        this.the_number_of_time_steps = this.data.length/this.bitsize;

        this.rectw = 5;
        this.recth = 5;

        d3.select('#GrandView').html('');
        d3.select('#GrandView').append('canvas')
            .attr('id', 'grandview_canvas')
            .attr('width', this.width)
            .attr('height', this.the_number_of_time_steps * this.recth + this.top_padding * 2);
        
        this.ctx=$('#grandview_canvas')[0].getContext("2d");
        this.draw();
    }

    setData(message, data){

        this.data = data;
        this.init();
    }

    draw(){
        
        this.colorscale = d3.scaleLinear().domain(this.grandviewdata.getMaxMin_Absolute()).range([0,1])
        
        for(let i = 0; i < this.the_number_of_time_steps; i++){
            for(let j = 0; j < this.bitsize; j++){
                //type  
                this.ctx.fillStyle = this.outcome_color[this.data[i * this.bitsize + j]['outcome']];
                this.ctx.strokeStyle="#f0f0f0";
                this.ctx.strokeRect(this.x + (this.bitsize - j) * this.rectw, this.y + i * this.recth, this.rectw, this.recth);
                this.ctx.fillRect(this.x + (this.bitsize - j) * this.rectw, this.y + i * this.recth, this.rectw, this.recth);
            }
        }

        
    }
}