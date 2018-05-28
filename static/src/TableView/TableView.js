class TableView extends BasicView{
    constructor(container){
        super(container);

        
    }


    init(data){

        this.clean();

        this.table = d3.select('#tableView').append('table');

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

        let tbody =this.table.append('tbody');
        tbody.selectAll('.tableView_tbody_tr')
        .data(this.data)
        .enter()
        .append('tr')
        .on('click', (d)=>{
            publish('SINGLE_SIMULATION', d);
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
