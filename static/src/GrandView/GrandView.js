class GrandView extends BasicView{
    
    constructor(container) {
        super(container);
        //this.outcome_color = {
        //    'DUE': '#542788',
        //    'Masked': '#99d594',
        //    'SDC': '#fc8d59'
        //}  

        //color blind safe
        this.outcome_color = {
            'DUE': '#542788',
            'Masked': '#1b9e77',
            'SDC': '#d95f02'
        }   

        this.top_padding = 250;
        this.left_padding = 100;
        this.right_padding = 10;
        this.y = this.top_padding;
        this.x = this.left_padding;
        this.bitsize = 64;
    }

    init(){

        super.init();

        this.grandviewdata = new GrandViewData(this.data);

        this.grandviewdata.getMaxMin_Absolute();

        this.the_number_of_time_steps = 800;//this.grandviewdata.getNumberOfDynamicInstruction();

        this.rectw = 5;
        this.recth = 5;

        d3.select('#GrandView').html('');
        d3.select('#GrandView').append('canvas')
            .attr('id', 'grandview_canvas')
            .attr('width', this.the_number_of_time_steps * this.rectw + this.top_padding * 2)
            .attr('height',  this.height);
        
        this.ctx=$('#grandview_canvas')[0].getContext("2d");
        this.draw();
    }

    setData(message, data){
        this.data = data;
        this.init();
    }

    draw(){
        
        /*this.colorscale = d3.scaleLinear().domain(this.grandviewdata.getMaxMin_Absolute()).range([0,1]).clamp(true);


        //for(let i = 0; i < this.data.length; i++){
        for(let i = 0; i < this.the_number_of_time_steps * 64; i++){
            this.ctx.fillStyle = this.outcome_color[this.data[i]['outcome']];

            this.ctx.strokeStyle = "#f0f0f0";

            this.ctx.strokeRect(this.x + (+this.data[i].DI - 1) * this.rectw, this.y + (this.bitsize - +this.data[i].bit)  * this.rectw, this.rectw, this.recth);
            this.ctx.fillRect(this.x + (+this.data[i].DI - 1) * this.rectw, this.y + (this.bitsize - +this.data[i].bit) * this.rectw, this.rectw, this.recth);
        }*/


       /* for(let i = 0; i < this.the_number_of_time_steps; i++){
            for(let j = 0; j < this.bitsize; j++){
                //type  
                this.ctx.fillStyle = this.outcome_color[this.data[i * this.bitsize + j]['outcome']];
                
                //if(this.data[i * this.bitsize + j]['diffnormr'] != 'nan'){
                //    this.ctx.fillStyle = d3.interpolateOranges(Math.log10(+this.data[i * this.bitsize + j].diffnormr));
                //}else{
                //    this.ctx.fillStyle = 'white';
                //}

               this.ctx.strokeStyle = "#f0f0f0";

                this.ctx.strokeRect(this.x + i * this.rectw, this.y + (this.bitsize - j) * this.rectw, this.rectw, this.recth);
                this.ctx.fillRect(this.x + i * this.rectw, this.y + (this.bitsize - j) * this.rectw, this.rectw, this.recth);
            }
        }*/
    }
}