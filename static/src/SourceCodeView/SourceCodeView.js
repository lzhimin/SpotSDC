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
            return i%2 == 1 ? 'white' : '#eee';
        });
        /*.classed('sourceCode_odd_line', (d, i)=>{
            if(i == +data.line-1)
                return false;
            return i%2 == 1 ? true : false;
        })
        .classed('sourceCode_even_line', (d, i)=>{
            if(i == +data.line-1)
                return false;
            return i%2 == 0 ? true: false;
        })
        .classed('sourceCode_highlight', (d, i)=>{
            return i == +data.line-1? true : false;
        });*/
    }

    setSourceCodeFile(msg, data){
        $('#sourceCode_display').load('static/code/'+data.split('_')[0]+'.html', ()=>{
            PR.prettyPrint();
        });
    }
}