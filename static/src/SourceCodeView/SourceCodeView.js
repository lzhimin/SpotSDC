class SourceCodeView extends BasicView{
    constructor(container){
        super(container);
    }

    setHighLightIndex(msg, data){

        console.log(data);
        //scroll div to the target line
        let offset = $('#sourceCode_display li')[+data.line-1].offsetTop;
        this.container.getElement()[0].scrollTop = offset - $(this.container.getElement()[0]).height()/2;

        //highlight
        d3.selectAll('#sourceCode_display li')
        .style('background', (d, i)=>{
            if(i == +data.line-1)
                return 'orange';
            return i%2 == 1 ? '#f5f5f5' : '#fff';
        });
    }

    setSourceCodeFile(msg, data){
        $('#sourceCode_display').load('static/code/'+data.split('_')[0]+'.html', ()=>{
            PR.prettyPrint();
        });
    }
}