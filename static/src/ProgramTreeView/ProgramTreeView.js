class ProgramTreeView extends BasicView{

    constructor(container){
        super(container);
        this.programtreedata = new ProgramTreeData();
        this.outcome_color = {
            'DUE': '#cbd5e8',
            'Masked': '#b3e2cd',
            'SDC': '#fdcdac'
        }   

        this.colorscale = ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603']; 
        this.stackbar_bucket = {};
        this.bit_heatmap_bucket = {};
        this.impact_heatmap_bucket = {};
        this.value_heatmap_bucket = {};
        this.cdf_bucket = {};
    }

    init(){
        super.init();

        this.blockw = 60;
        this.blockh = 40;

        this.top_padding = this.y = 180;
        this.left_padding = this.x = 20;
        this.bottom_padding = 10;

        this.bitmap_width = 250;
        this.stackbar_width = 200;

        d3.select('#ProgramTreeViewCanvas').html('');
        this.svg = d3.select('#ProgramTreeViewCanvas').append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
    }

    draw(){
        //reset all the content on canvas
        this.init();
        this.draw_tree();
        this.draw_menu();
    }

    draw_tree(){

        let hierachicaldata = this.programtreedata.getHierachicalData();
        let x = this.left_padding, y = this.top_padding, h=0;
        let padding = 3;
        hierachicaldata.values.forEach((d, index)=>{
            h += this.draw_inner_node(20 + this.blockw, y + h, d);
            h += padding;
        });

        //if the current svg is smaller than the current size of tree
        if(this.height < this.top_padding + h + this.bottom_padding){
            this.svg.attr('height', this.top_padding + h + this.bottom_padding);
        }
        this.draw_node(x, y, h - padding, this.blockw, hierachicaldata);
    }

    draw_inner_node(x, y, data){

        let height_of_current_node = 0;
        //fix the order
        data.values.sort(function(a, b){
            return a.key > b.key;
        });

        if(this.is_the_node_a_leaf(data)){
            //recursive draw the tree node
            data.values.forEach((d, index)=>{
                height_of_current_node += this.draw_inner_node(x + this.blockw, y + height_of_current_node, d);
            });
        }
        else{
            height_of_current_node = this.blockh;
            this.draw_leaf_vis(x + this.blockw + 20, y, data);
        }
        this.draw_node(x, y, height_of_current_node, this.blockw, data);
        return height_of_current_node;
    }

    draw_node(x, y, h, w, d){
        this.svg.selectAll('.treenode_'+d.key).data([d.key]).enter().append('rect')
            .attr('width', w)
            .attr('height', h)
            .attr('x', x)
            .attr('y', y)
            .attr('rx', 5)
            .attr('ry', 5)
            .classed('tree_node', true);

        this.svg.selectAll('.treetext_'+d.key).data([d.key]).enter().append('text')
            .text(d=>d)
            .attr('x', (d, i)=>{
                return x + w / 2;
            })
            .attr('y', (d, i)=>{
                return y + h / 2;
            })
            .classed('programTreeView_text', true)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('font-size', (d, i, node)=>{
                let labelWidth = node[i].getComputedTextLength();
                if (labelWidth < this.blockw) {
                    return null;
                }
                return ((this.blockw - 4) / labelWidth) + 'em';
            })
            .style('pointer-events', 'none');            
    }

    draw_leaf_vis(x, y, data){

        this.bit_heatmap_bucket[data.key] = new BitHeatMap(this.svg, x, y, this.bitmap_width, this.blockh, data);
        this.bit_heatmap_bucket[data.key].setColormapColor(this.colorscale);
        this.bit_heatmap_bucket[data.key].draw();

        this.stackbar_bucket[data.key] = new StackBarChart(this.svg, x + this.bitmap_width + 20, y, this.stackbar_width, this.blockh, data);
        this.stackbar_bucket[data.key].setOutcomeColor(this.outcome_color);
        this.stackbar_bucket[data.key].draw();
    }

    draw_menu(){
        let x = this.x + this.programtreedata.getTreeHeight() * this.blockw + this.padding;
        let y = 50;
        //draw distribution chart menu

        let chartOptions = ['Bit', 'Value', 'Impact']
        this.svg.selectAll('.programTreeViewMenu').data(chartOptions).enter()
        .append('text')
        .text(d=>d)
        .attr('x', (d, i)=>{
            return x + 50 * i;
        })
        .attr('y', y);



        //draw ratio chart menu

    }

    is_the_node_a_leaf(data){
        return 'key' in data.values[0] && !(data.values[0].key in this.outcome_color);
    }

    setData(msg, data){
        this.programtreedata.setData(data);
        this.draw();
    }
}

