class ErrorPropagationController{

    constructor(){
        this.error_option = 'Relative';
        this.play_trigger = true; 
    }

    binding(){

        $('input:radio[name="propagatation_error_radio"]').unbind();
        $('input:radio[name="propagatation_error_radio"]').change((d, i, node)=>{
            this.error_option = $('input:radio[name="propagatation_error_radio"]:checked').val();        
            this.callback(this.error_option);
        });

        $('#ErrorPropagationView_backward_control').unbind()
        $('#ErrorPropagationView_backward_control').on('click', ()=>{
            this.update(-1, 'manual');
        });

        $('#ErrorPropagationView_play_pause_control').unbind();
        $('#ErrorPropagationView_play_pause_control').on('click', ()=>{
            if(d3.select('#ErrorPropagationView_play_pause_control_icon').classed('glyphicon-play')){
                d3.select('#ErrorPropagationView_play_pause_control_icon').classed('glyphicon-pause', true);
                d3.select('#ErrorPropagationView_play_pause_control_icon').classed('glyphicon-play', false);
            
                //start the animation
                this.clock = setInterval(this.update.bind(this), 100);
            }else{
                d3.select('#ErrorPropagationView_play_pause_control_icon').classed('glyphicon-play', true);
                d3.select('#ErrorPropagationView_play_pause_control_icon').classed('glyphicon-pause', false);
                
                //stop the animation
                clearInterval(this.clock);
            }
        });

        $('#ErrorPropagationView_forward_control').unbind();
        $('#ErrorPropagationView_forward_control').on('click', ()=>{
            this.update(1, 'manual');
        });
    }

    getOption(){
        return this.error_option;
    }

    set_change_Relative_And_Absolute_Option_callback(callback){
        this.callback = callback;
    }

    update(step=1, option ='auto'){
        if(!this.timeStepChangeFunc(step) && option == 'auto'){
            clearInterval(this.clock);
        }
    }

    setTimerStepChangeCallBack(callback){
        this.timeStepChangeFunc = callback;
    }
}