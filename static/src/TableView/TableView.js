class TableView extends BasicView{
    constructor(container){
        super(container);

        
    }


    init(data){

        this.clean();

        this.table = d3.select('#tableView').append('table')
            .classed('table', true)
            .classed('table-condensed ', true)
            .classed('table-hover', true);

        this.data = data;

        this.table_name = Object.keys(this.data[0])
    }

    setData(msg, data){

        //if there is not data
        if(data.length == 0)
            return;

        this.init(data);

        this.draw();
    }

    clean(){
        d3.select('#tableView').html('');
    }

    draw(){

        let thead = this.table.append('thead').append('tr');

        thead.selectAll('.tableView_thead_tr_th').data(this.table_name).enter()
        .append('th')
        .html(d=>d);

        //sort this.data based on the input error
        this.data.sort(function(a, b){
            return +a.out_xor - +b.out_xor;
        });

        let tbody =this.table.append('tbody');
        tbody.selectAll('.tableView_tbody_tr')
        .data(this.data)
        .enter()
        .append('tr')
        .on('click', (d)=>{
            fetchSingleSimulationData(d.File_index);
        })
        .on('mouseover', (d)=>{
            publish('HIGHLIGHT', d);
        })
        .on('mouseout', (d)=>{
            publish('DISHIGHLIGHT', d);
        })
        .selectAll('tableView_tbody_td')
        .data(d=>{
            let item = [];
            for(let i = 0; i < this.table_name.length; i++){
                item.push(d[this.table_name[i]]);
            }
            return item;
        })
        .enter()
        .append('td')
        .html(d=>d);
    }
}
