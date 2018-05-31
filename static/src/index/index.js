let myLayout = new GoldenLayout(config);

//ptv: program tree view
//scv: source code view
//tv: table view
//epv: error propagation view
let ptv, scv, tv, epv;

myLayout.registerComponent('ProgramTreeView', function(container, state){
    $(container.getElement()[0]).load('../static/src/ProgramTreeView/ProgramTreeView.html');
    //program Tree view, subscribe to data event
    ptv = new ProgramTreeView(container);
    subscribe('DATASET', ptv.setData.bind(ptv));
});

myLayout.registerComponent('ErrorPropagationView', function(container, state){
    //error propagation view subscribe to single simulation data
    epv = new ErrorPropagationView(container);
    $(container.getElement()[0]).load('../static/src/ErrorPropagationView/ErrorPropagationView.html');
    subscribe('SINGLE_SIMULATION', epv.setData.bind(epv));
});

myLayout.registerComponent('TableView', function(container, state){
    //table view, subscribe to subset data
    $(container.getElement()[0]).load('../static/src/TableView/TableView.html');
    tv = new TableView(container);
    subscribe('SUBSETDATA', tv.setData.bind(tv));
});

myLayout.registerComponent('SourceCodeView', function(container, state){
    $(container.getElement()[0]).load('../static/src/SourceCodeView/SourceCodeView.html');
    //source code view, subscribe to source code event
    scv = new SourceCodeView(container);
    subscribe('SOURCECODE', scv.setSourceCodeFile.bind(scv));
});

myLayout.on('itemCreated', (item)=>{
    if( item.config.cssClass ){
      item.element.addClass( item.config.cssClass );
    }
});

myLayout.init();

// define global function
function changeFile(){
    let filename = $('#program_TreeView_file_selector').val();
    fetchDataset(filename);

    //public source code file
    publish('SOURCECODE', filename);
}


