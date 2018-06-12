class ErrorPropagationController{

    constructor(){
        this.error_option = 'Relative';
        this.binding();
    }

    binding(){
        $('input:radio[name="propagatation_error_radio"]').change((d, i, node)=>{
            this.error_option = $('input:radio[name="propagatation_error_radio"]:checked').val();        
            this.callback(this.error_option);
        });
    }

    getOption(){
        return this.error_option;
    }

    set_change_Relative_And_Absolute_Option_callback(callback){
        this.callback = callback;
    }
}