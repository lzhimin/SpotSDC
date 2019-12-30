function fetchDataset(filename) {
    console.log(filename);
    d3.csv('../static/data/' + filename + '.csv').then(function (data) {
        publish('DATASET', data);
    });
}

function fetchSingleSimulationData(index) {
    d3.csv("../static/data/cg/cg_in8/appstate_" + index + ".log").then(function (data) {
        let keys = ['file', 'linenum', 'variable', 'value'];
        let parsedata = data.map((d) => {
            let item = {};
            Object.values(d)[0].split(" ").forEach((d, i) => {
                item[keys[i]] = d;
            });
            return item;
        });
        publish('SINGLE_SIMULATION', parsedata);
    });
}

function fetchResiliencySimulationData(json) {
    $.ajax({
        url: '/_fetch_data',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(json),
        dataType: 'json',
        success: function (data) {
            publish("RESILENCY_SINGLE_SIMULATION", data)
        }
    });

}

function fetchMultipleSimulationData(json) {
    $.ajax({
        url: '/_fetch_data',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(json),
        dataType: 'json',
        success: function (data) {
            publish("MULTIPLE_SIMULATION", data)
        }
    });
}

function fetch_data(json) {

    console.log(json);
    $.ajax({
        url: '/_fetch_data',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(json),
        dataType: 'json',
        success: function (data) {
            publish("MASKED_BOUNDARY", data)
        }
    });
}

function fetchGoldenSimulationData(path) {
    let folder = path.split("_")[0];
    let keys = ['file', 'linenum', 'variable', 'value'];
    d3.tsv('../static/data/' + folder + "/" + path + "/golden.log").then(function (data) {
        let parsedata = data.map((d) => {
            let item = {};
            Object.values(d)[0].split(" ").forEach((d, i) => {
                item[keys[i]] = d;
            });
            return item;
        });
        publish('SINGLE_SIMULATION_GOLDEN', parsedata);
    });
}