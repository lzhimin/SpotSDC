class SourceCodeView extends BasicView{
    constructor(container){
        super();
        
        //set container div overflow:auto 
        d3.select(container.getElement()[0]).style('overflow', 'auto');
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