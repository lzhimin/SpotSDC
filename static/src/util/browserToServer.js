function fetchDataset(filename){
    console.log(filename);
    d3.csv('../static/data/'+filename+'.csv').then(function(data){
        publish('DATASET', data);
    });
}

function fetchSingleSimulationData(index){
    d3.csv("../static/data/cg_simulation/appstate_"+index+".log").then(function(data){
        publish('SINGLE_SIMULATION', data);
    });
}

function fetchMultipleSimulationData(indexs){
    let lists = [];
    for(let i = 0; i < indexs.length; i++)
        lists.push(d3.csv("../static/data/cg_simulation/appstate_"+ (indexs[i])+".log"));

    Promise.all(lists)
    .then((res)=>{
        publish("MULTIPLE_SIMULATION", res);
    });
}

function fetchGoldenSimulationData(){
    //let psv = d3.dsvFormat(' ');
    d3.csv('../static/data/cg_simulation/golden.log').then(function(data){
        publish('SINGLE_SIMULATION_GOLDEN', data);
    });
}

