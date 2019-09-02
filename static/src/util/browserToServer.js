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

function fetchMultipleSimulationData(json){
    $.ajax({
        url:'/_fetch_data',
        type:'POST',
        contentType:'application/json',
        data:JSON.stringify(json),
        dataType:'json',
        success:function(data){  
            publish("MULTIPLE_SIMULATION", data)
        }
    });  
}

function fetch_data(json){

    console.log(json);
    $.ajax({
        url:'/_fetch_data',
        type:'POST',
        contentType:'application/json',
        data:JSON.stringify(json),
        dataType:'json',
        success:function(data){  
            publish("MASKED_BOUNDARY", data)
        }
    });  
}

function fetchGoldenSimulationData(path){
    
    let folder = path.split("_")[0];

    d3.csv('../static/data/'+folder+"/"+path+"/golden.log").then(function(data){
        publish('SINGLE_SIMULATION_GOLDEN', data);
    });
}

