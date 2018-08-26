let myLayout = new GoldenLayout(config);

//ptv: program tree view
//scv: source code view
//tv: table view
//epv: error propagation view
//lav: location analysis view
let ptv, scv, tv, epv, lav;

myLayout.registerComponent('ProgramTreeView', function(container, state){
    $(container.getElement()[0]).load('../static/src/ProgramTreeView/ProgramTreeView.html');
    //program Tree view, subscribe to data event
    ptv = new ProgramTreeView(container);
    subscribe('DATASET', ptv.setData.bind(ptv));
});

myLayout.registerComponent('ErrorPropagationView', function(container, state){
    //error propagation view subscribe to single simulation data
    $(container.getElement()[0]).load('../static/src/ErrorPropagationView/ErrorPropagationView.html');

    epv = new ErrorPropagationView(container);
    
    //fetchGoldenSimulationData()
    subscribe('SDC_OVER_TIME', epv.setData.bind(epv));
    //subscribe('SINGLE_SIMULATION', epv.setData.bind(epv));
    //subscribe('SINGLE_SIMULATION_GOLDEN', epv.setGoldenRunData.bind(epv));
});

myLayout.registerComponent('SourceCodeView', function(container, state){
    $(container.getElement()[0]).load('../static/src/SourceCodeView/SourceCodeView.html');
    //source code view, subscribe to source code event
    scv = new SourceCodeView(container);

    subscribe('DATASET', scv.setData.bind(scv));
    subscribe('SOURCECODE', scv.setSourceCodeFile.bind(scv));
    subscribe('SOURCECODE_HIGHLIGHT', scv.setHighLightIndex.bind(scv));

});

myLayout.registerComponent('TableView', function(container, state){
    //table view, subscribe to subset data
    $(container.getElement()[0]).load('../static/src/TableView/TableView.html');
    tv = new TableView(container);
    subscribe('SUBSETDATA', tv.setData.bind(tv));
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
    fetch_SDC_Over_Time();
    //public source code file
    publish('SOURCECODE', filename);
}

function uuidv4() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }


