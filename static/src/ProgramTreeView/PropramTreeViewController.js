class ProgramViewController{
    constructor(){

        this.treestructurechangecallback = undefined;
        
        this.viewchangecallback = undefined;
        this.bitfilterchangecallback = undefined;

        this.normalizationchangecallback = undefined;
        this.outcomechangecallback = undefined;
    }

    setTreeStructureChangeCallback(func){
        this.treestructurechangecallback = func;
    }

    setViewChangeCallback(func){
        this.viewchangecallback = func;
    }

    setBitfilterChangeCallback(func){
        this.bitfilterchangecallback = func;
    }

    setNormalizationChangeCallback(func){
        this.normalizationchangecallback = func;
    }

    setOutcomeChangeCallback(func){
        this.outcomechangecallback = func;
    }

    bindingEvent(){
        this.bindingTreeMenu();
        this.bindingViewMenu();
        this.bindingNormalizationMenu();
        this.bindingFilterMenu();
    }

    bindingTreeMenu(){
        //reset everything
        $('#tree_level1').val('');
        $('#tree_level2').hide();
        $('#tree_level3').hide();


        //binding Tree structure change event
        $('#tree_level1').unbind();
        $('#tree_level1').change(()=>{
            let options = ['Function', 'Variable', 'Line', 'Iter'];
            let attr = $('#tree_level1').val();
            if(attr != ''){
                options.splice(options.indexOf(attr), 1);
                $('#tree_level2').html('');
                $('#tree_level2').append('<option></option>');

                options.forEach((d, i)=>{
                    $('#tree_level2').append('<option>'+d+'</option>');
                });

                //hide
                $('#tree_level2').show();
                $('#tree_level3').hide();
                this.treestructurechangecallback([attr])
            }else{
                $('#tree_level2').hide();
                $('#tree_level3').hide();
                this.treestructurechangecallback([]);
            }
        });

        $('#tree_level2').unbind();
        $('#tree_level2').change(()=>{
            let attr1 = $('#tree_level1').val();
            let attr2 = $('#tree_level2').val();

            let options = ['Function', 'Variable', 'Line', 'iter'];
            options.splice(options.indexOf(attr1), 1);
            options.splice(options.indexOf(attr2), 1);

            $('#tree_level3').html('');
            $('#tree_level3').append('<option></option>');
            options.forEach((d, i)=>{
                $('#tree_level3').append('<option>'+d+'</option>');
            });

            if(attr2 == ""){
                $('#tree_level3').hide();
                this.treestructurechangecallback([attr1]);
            }else{
                $('#tree_level3').show();
                this.treestructurechangecallback([attr1, attr2]);
            }
        });
        
        $('#tree_level3').unbind();
        $('#tree_level3').change(()=>{
            let attr1 = $('#tree_level1').val(),
            attr2 = $('#tree_level2').val(),
            attr3 = $('#tree_level3').val();

            if(attr3 == ''){
                this.treestructurechangecallback([attr1, attr2]);
            }else{
                this.treestructurechangecallback([attr1, attr2, attr3]);
            }
        });
    }

    bindingViewMenu(){
        //binding view change event.
        $('input:radio[name="view_radio"]').unbind();
        $('input:radio[name="view_radio"]').change(function () {
            let option = $('input[name=view_radio]:checked').val();
            this.viewchangecallback(option);
        });
    }

    bindingNormalizationMenu(){

        $('input:radio[name="normalize_radio"][value=local]').prop('checked', true);
        //binding normalization change event.
        $('input:radio[name="normalize_radio"]').unbind();
        $('input:radio[name="normalize_radio"]').change(()=>{
            let option = $('input[name=normalize_radio]:checked').val();
            this.normalizationchangecallback(option);
        });
    }

    bindingFilterMenu(){

        $('#program_TreeView_Filter_Option').unbind();
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


        //bit filter

        //outcome filter
        
    }
}