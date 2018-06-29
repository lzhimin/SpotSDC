class ProgramViewController{
    constructor(){

        this.treestructurechangecallback = undefined;
        
        this.samplesizechangecallback = undefined;
        this.viewchangecallback = undefined;
        this.bitfilterchangecallback = undefined;

        this.normalizationchangecallback = undefined;
        this.outcomechangecallback = undefined;
    }

    bindingEvent(){

        this.bindingTreeMenu();
        this.bindingViewMenu();
        this.bindingNormalizationMenu();
        this.bindingFilterMenu();
    }

    bindingTreeMenu(){
        //binding Tree structure change event

    }

    bindingViewMenu(){
        //binding view change event.
        $('input:radio[name="view_radio"]').change(function () {
            let option = $('input[name=view_radio]:checked').val();
            this.viewchangecallback(option);
        });
    }

    bindingNormalizationMenu(){
        //binding normalization change event.
        $('input:radio[name="normalize_radio"]').change(()=>{
            let option = $('input[name=normalize_radio]:checked').val();
            this.normalizationchangecallback(option);
        });
    }

    bindingFilterMenu(){
        $('#program_TreeView_Filter_Option').change(()=>{
            let option = $('#program_TreeView_Filter_Option').val();

            if(option == 'bit'){
                d3.select('#program_TreeView_filter_bit').style('display', 'block');
                d3.select('#program_TreeView_filter_outcome').style('display', 'none');
            }
            else if(option == 'outcome'){
                d3.select('#program_TreeView_filter_bit').style('display', 'none');
                d3.select('#program_TreeView_filter_outcome').style('display', 'block');
            }
        });
    }
}