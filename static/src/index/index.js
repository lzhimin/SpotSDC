let myLayout = new GoldenLayout(config);

//ptv: program tree view
//scv: source code view
//tv: table view
//epv: error propagation view
//sp: individual scatter plot
//rv: resiliency view
let ptv, scv, tv, epv, sp, rv;

myLayout.registerComponent('ProgramTreeView', function (container, state) {
    $(container.getElement()[0]).load('../static/src/ProgramTreeView/ProgramTreeView.html');
    //program Tree view, subscribe to data event
    ptv = new ProgramTreeView(container);
    subscribe('DATASET', ptv.setData.bind(ptv));
    subscribe("THRESHOLD_CHANGE_EVENT", ptv.setThresholdValue.bind(ptv));
});

myLayout.registerComponent('ErrorPropagationView', function (container, state) {
    //error propagation view subscribe to single simulation data
    $(container.getElement()[0]).load('../static/src/ErrorPropagationView/ErrorPropagationView.html');

    epv = new ErrorPropagationView(container);

    subscribe('DATASET', epv.setSummaryData.bind(epv));
    subscribe('SINGLE_SIMULATION', epv.setErrorRunData.bind(epv));
    subscribe('SINGLE_SIMULATION_GOLDEN', epv.setGoldenRunData.bind(epv));
});

myLayout.registerComponent('faultToleranceBoudanryView', function (container, state) {
    //error propagation view subscribe to single simulation data
    $(container.getElement()[0]).load("../static/src/faultToleranceBoudanry/faultToleranceBoudanry.html");
    rv = new FaultToleranceBoudanryView(container);

    subscribe("DATASET", rv.setData.bind(rv));
    subscribe("SINGLE_SIMULATION_GOLDEN", rv.setGoldenRunData.bind(rv));
    subscribe('MULTIPLE_SIMULATION', rv.addMultipleSimulation.bind(rv));
    subscribe("MASKED_BOUNDARY", rv.updateChart.bind(rv))
    subscribe('RESILENCY_SINGLE_SIMULATION', rv.resiliency_single_simulation.bind(rv));
});

myLayout.registerComponent('ScatterPlot', function (container, state) {
    //error propagation view subscribe to single simulation data
    $(container.getElement()[0]).load('../static/src/ScatterPlot/ScatterPlot.html');

    sp = new ScatterPlot(container);

    subscribe('SUBSETDATA', sp.setData.bind(sp));
    subscribe('HIGHLIGHT', sp.highlight.bind(sp));
    subscribe("DISHIGHLIGHT", sp.dishighlight.bind(sp));

});

myLayout.registerComponent('SourceCodeView', function (container, state) {
    $(container.getElement()[0]).load('../static/src/SourceCodeView/SourceCodeView.html');
    //source code view, subscribe to source code event
    scv = new SourceCodeView(container);

    subscribe('DATASET', scv.setData.bind(scv));
    subscribe('SOURCECODE', scv.setSourceCodeFile.bind(scv));
    subscribe('SOURCECODE_HIGHLIGHT', scv.setHighLightIndex.bind(scv));

});

myLayout.registerComponent('TableView', function (container, state) {
    //table view, subscribe to subset data
    $(container.getElement()[0]).load('../static/src/TableView/TableView.html');
    tv = new TableView(container);
    subscribe('SUBSETDATA', tv.setData.bind(tv));
});

myLayout.on('itemCreated', (item) => {
    if (item.config.cssClass) {
        item.element.addClass(item.config.cssClass);
    }
});

myLayout.init();

// define global function
function changeFile() {
    let filename = $('#program_TreeView_file_selector').val();
    fetchDataset(filename);

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