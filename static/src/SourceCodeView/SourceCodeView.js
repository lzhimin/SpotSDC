class SourceCodeView extends BasicView{
    constructor(container){
        super(container);
    }

    clean(){
        $('#sourceCode_display').html('');
    }

    setSourceCodeFile(msg, data){
        $('#sourceCode_display').load('static/code/'+data.split('_')[0]+'.html', ()=>{
            PR.prettyPrint();
        });
    }
}