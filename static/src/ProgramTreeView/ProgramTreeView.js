class ProgramTreeView extends BasicView{

    constructor(container){
        super(container);
        this.programtreedata = new ProgramTreeData();
        this.programtreecontroller = new ProgramViewController();
        this.outcome_color = {
            'DUE': '#cbd5e8',
            'Masked': '#b3e2cd',
            'SDC': '#fdcdac'
        }   

        this.colorscale = ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603']; 
    }

    init(){
        super.init();

        this.blockw = 60;
        this.blockh = 40;

        this.top_padding = this.y = 150;
        this.left_padding = this.x = 20;
        this.padding = 20;
        this.bottom_padding = 10;

        this.padding_between_bit_stack = 20;
        this.bitmap_width = 250;
        this.stackbar_width = 200;

        this.stackbar_bucket = {};
        this.bit_heatmap_bucket = {};
        this.impact_heatmap_bucket = {};
        this.value_heatmap_bucket = {};
        this.cdf_bucket = {};

        d3.select('#ProgramTreeViewCanvas').html('');
        this.svg = d3.select('#ProgramTreeViewCanvas').append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.callbackBinding();
    }

    draw(){
        //reset all the content on canvas
        this.draw_tree();
        this.draw_menu();
        this.draw_annotation();
    }

    draw_tree(){

        let hierachicaldata = this.programtreedata.getHierachicalData();
        let x = this.left_padding, y = this.top_padding, h=0;
        let padding = 3;

        hierachicaldata.values.sort(function(a, b){
            return a.key > b.key;
        });

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
            this.draw_leaf_vis(x + this.blockw + this.padding, y, data);
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

        this.stackbar_bucket[data.key] = new StackBarChart(this.svg, x + this.bitmap_width + this.padding_between_bit_stack, y, this.stackbar_width, this.blockh, data);
        this.stackbar_bucket[data.key].setOutcomeColor(this.outcome_color);
        this.stackbar_bucket[data.key].draw();
    }

    draw_menu(){
        
        let x = this.x + this.programtreedata.getTreeHeight() * this.blockw + this.left_padding;
        let y = 100;

        //draw tree menu
        d3.select('#ProgramTree_Tree_Menu')
        .style('display', 'block')
        .style('position', 'absolute')
        .style('top', this.top_padding + $('#ProgramTreeViewMenu').height() - 20)
        .style('left', this.left_padding + this.blockw);

        d3.selectAll('.tree_attribute').style('width', this.blockw - 3);

        //draw distribution chart menu
        d3.select('#ProgramTree_impact_chart_menu')
        .style('display', 'block')
        .style('position', 'absolute')
        .style('top',$('#ProgramTreeViewMenu').height() + 10)
        .style('left', x);
        
        //draw ratio 
        d3.select('#ProgramTree_ratio_chart_menu')
        .style('display', 'block')
        .style('position', 'absolute')
        .style('top', $('#ProgramTreeViewMenu').height() + 10)
        .style('left', x + this.bitmap_width + this.padding_between_bit_stack);
    }

    draw_annotation(){
        this.svg.selectAll('.programTreeViewMenu_annotation').data(['sign', 'exponent', 'mantissa'])
        .enter()
        .append('text')
        .text(d=>d)
        .attr('x', (d, i)=>{
            if(i==0) 
                return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width/128;
            else if(i == 1)
                return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width/8;
            else 
                return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width* 19/32;
        })
        .attr('y', (d, i)=>{
            return this.top_padding - 20;
        }) 
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style('font-size', 8);

        let colorscale = ['white'].concat(this.colorscale);
        let colorscale_w = this.bitmap_width/(2 * colorscale.length);
        let colorscale_h = 20;
        this.svg.selectAll('.colorscale').data(colorscale).enter()
        .append('rect')
        .attr('x', (d, i)=>{
            return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width/3 + colorscale_w * i;
        })
        .attr('y', (d, i)=>{
            return this.top_padding - 60;
        })
        .attr('width', colorscale_w)
        .attr('height', colorscale_h)
        .attr('fill', (d, i)=>{
            return d;
        })
        .style('stroke', 'gray')
        .style('stroke-width', '1px');

        //ratio
        let ratio_chart_x = this.left_padding + this.blockw * 4 + this.padding * 2 + this.bitmap_width;
        this.stackbar_chart_axis = d3.scaleLinear().range([ratio_chart_x, ratio_chart_x + this.stackbar_width]).domain([0, 1]);
        this.stackbar_chart_axis_annotation = this.svg.append('g').attr('class','axis axis--x')
            .attr("transform", "translate(0,"+ (this.top_padding - 20) + ")")
            .call(d3.axisTop(this.stackbar_chart_axis).ticks(5));

    }

    is_the_node_a_leaf(data){
        return 'key' in data.values[0] && !(data.values[0].key in this.outcome_color);
    }

    setData(msg, data){
        this.programtreedata.setData(data);
        this.init();
        this.draw();
    }

    /**
     *  callback binding
     **/
    callbackBinding(){
        this.programtreecontroller.bindingEvent();
        this.programtreecontroller.setNormalizationChangeCallback(this.updateStackChart.bind(this));
        //this.programtreecontroller.setBitfilterChangeCallback()
    }

    updateStackChart(option){
        if(option == 'global'){
            let maxsize = 0;

            for(let key in  this.stackbar_bucket){
                maxsize = Math.max(maxsize, this.stackbar_bucket[key].getExperimentCount());
            }

            for(let key in this.stackbar_bucket){
                this.stackbar_bucket[key].setMaxDataSize(maxsize);
                this.stackbar_bucket[key].setGlobalFlag(true);
                this.stackbar_bucket[key].draw();
            }

            this.stackbar_chart_axis.domain([0, maxsize]);
        }else if(option == 'local'){
            for(let key in this.stackbar_bucket){
                this.stackbar_bucket[key].setGlobalFlag(false);
                this.stackbar_bucket[key].draw();
            }

            this.stackbar_chart_axis.domain([0, 1]);
        }

        //update axis
        this.stackbar_chart_axis_annotation.transition(1500).call(d3.axisTop(this.stackbar_chart_axis).ticks(5));
    }
}

