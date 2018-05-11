class ProgramTreeView extends BasicView{

    constructor(container){
        super(container);
 
        this.programtreedata = new ProgramTreeData();
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

    draw(){
        
    }

    setData(msg, data){
        this.init();
        this.programtreedata.setData(data);
    }
}

