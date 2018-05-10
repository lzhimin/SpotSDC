class ProgramTreeView extends BasicView{

    constructor(container){
        super(container);
    }
    
    setFilename(){
        //fetch data from server
    }

    init(){
        d3.select('#ProgramTreeViewCanvas').exit().remove();
        this.width = this.container.getElement().width();
        this.height = this.container.getElement().height() - 20;

        d3.select('#ProgramTreeViewCanvas').append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
    }

    setData(msg, data){
        this.init();

        this.data = data;
    }
}

