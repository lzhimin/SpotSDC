function fetchDataset(filename){

    console.log(filename);

    d3.csv('../static/data/'+filename+'.csv').then(function(data){
        publish('DATASET', data);
    });
}

function fetchSourceCodeData(){

}

function fetchSingleSimulationData(index){

    let psv = d3.dsvFormat(' ');

    d3.request('../static/data/cg_simulation/appstate_'+index+'.log')
    .mimeType('text/plain')
    .response(function(xhr){
        return psv.parse('filename line var value\n'+xhr.responseText);
    })
    .get(function(d){
        publish('SINGLE_SIMULATION', d);
    });
}

function fetchGoldenSimulationData(){
    let psv = d3.dsvFormat(' ');

    d3.request('../static/data/cg_simulation/appstate_12960.log')
    .mimeType('text/plain')
    .response(function(xhr){
        return psv.parse('filename line var value\n'+xhr.responseText);
    })
    .get(function(d){
        publish('SINGLE_SIMULATION_GOLDEN', d);
    });
}

