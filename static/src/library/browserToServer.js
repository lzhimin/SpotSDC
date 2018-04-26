function fetchDataset(filename){
    
    d3.csv('../static/data/'+filename+'.csv').then(function(data){
        publish('DATASET', data);
    });
}

function fetchSourceCodeData(){

}

function fetchSingleSimulationData(){

}


