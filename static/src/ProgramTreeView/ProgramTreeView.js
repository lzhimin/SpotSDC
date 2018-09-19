class ProgramTreeView extends BasicView{

    constructor(container){
        super(container);
        
        this.programtreedata = new ProgramTreeData();
        
        this.programtreecontroller = new ProgramViewController();

        this.outcome_color = {
            'DUE': '#542788',
            'Masked': '#1b9e77',
            'SDC': '#d95f02'
        }   

        this.colorscale = ['#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5','#08519c','#08306b'];
        
        this.viewoption = 'bitStackBarChart';
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
        this.smart_bit_heatmap_bucket = {};
        this.impact_heatmap_bucket = {};
        this.value_heatmap_bucket = {};
        this.bitStackBarChart_bucket = {};
        this.valueStack_bucket = {};

        //this.callbackBinding();

        //clean svg
        d3.select('#ProgramTreeViewCanvas').html('');
        this.svg = d3.select('#ProgramTreeViewCanvas').append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
    }

    draw(){

        this.init();
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

        if(this.is_the_node_a_leaf(hierachicaldata)){
            hierachicaldata.values.forEach((d, index)=>{
                h += this.draw_inner_node(20 + this.blockw, y + h, d, hierachicaldata.key);
                h += padding;
            });
        }else{
            h += this.blockh;
            this.draw_leaf_vis(x + this.blockw * 2 + this.padding, y, hierachicaldata);
        }

        //if the current svg is smaller than the current size of tree
        if(this.height < this.top_padding + h + this.bottom_padding){
            this.svg.attr('height', this.top_padding + h + this.bottom_padding);
        }
        this.draw_node(x, y, h - padding, this.blockw, hierachicaldata);
    }

    draw_inner_node(x, y, data, parent){

        let height_of_current_node = 0;
        //fix the order
        data.values.sort(function(a, b){
            return a.key > b.key;
        });

        if(this.is_the_node_a_leaf(data)){
            //recursive draw the tree node
            data.values.forEach((d, index)=>{
                height_of_current_node += this.draw_inner_node(x + this.blockw, y + height_of_current_node, d, parent+'_'+data.key);
            });
        }
        else{
            height_of_current_node = this.blockh;
            this.draw_leaf_vis(x + this.blockw + this.padding, y, data, parent+'_'+data.key);
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

    draw_leaf_vis(x, y, data, parent){

        x = this.left_padding + this.blockw * 4 + this.padding;
    
        this.bit_heatmap_bucket[parent+'_'+data.key] = new BitHeatMap(this.svg, x, y, this.bitmap_width, this.blockh, data);
        this.bit_heatmap_bucket[parent+'_'+data.key].setColormapColor(this.colorscale);
        //this.bit_heatmap_bucket[parent+'_'+data.key].draw();

        this.smart_bit_heatmap_bucket[parent+'_'+data.key] = new SmartBitHeatMap(this.svg, x, y, this.bitmap_width, this.blockh, data, this.programtreedata.getLowestProblemBit());
        this.smart_bit_heatmap_bucket[parent+'_'+data.key].setColormapColor(this.colorscale);

        this.stackbar_bucket[parent+'_'+data.key] = new StackBarChart(this.svg, x + this.bitmap_width + this.padding_between_bit_stack, y, this.stackbar_width, this.blockh, data);
        this.stackbar_bucket[parent+'_'+data.key].setOutcomeColor(this.outcome_color);
        this.stackbar_bucket[parent+'_'+data.key].draw();

        this.value_heatmap_bucket[parent+'_'+data.key] = new ValueHeatMap(this.svg, x, y, this.bitmap_width, this.blockh, data, this.programtreedata.getMaxInput(), this.programtreedata.getMinInput());
        this.value_heatmap_bucket[parent+'_'+data.key].setColor(this.colorscale);

        this.impact_heatmap_bucket[parent+'_'+data.key] = new ImpactHeatmap(this.svg, x, y, this.bitmap_width, this.blockh, data, this.programtreedata.getMaxDiff(), this.programtreedata.getMinDiff());
        this.impact_heatmap_bucket[parent+'_'+data.key].setOutcomeColor(this.colorscale);

        this.bitStackBarChart_bucket[parent+'_'+data.key] = new BitStackChart(this.svg, x, y, this.bitmap_width, this.blockh, data);
        this.bitStackBarChart_bucket[parent+'_'+data.key].setOutcomeColor(this.outcome_color);
        
        this.valueStack_bucket[parent+'_'+data.key] = new valueStack(this.svg, x, y, this.bitmap_width, this.blockh, data, this.programtreedata.getMaxDiff(), this.programtreedata.getMinDiff())
        this.valueStack_bucket[parent+'_'+data.key].setOutcomeColor(this.outcome_color);

        if(this.viewoption == 'bit_heatmap')
            this.bit_heatmap_bucket[parent+'_'+data.key].draw();
        else if(this.viewoption == 'smart_bit_heatmap')
            this.smart_bit_heatmap_bucket[parent+'_'+data.key].draw();
        else if(this.viewoption == 'heatmap_impact')
            this.impact_heatmap_bucket[parent+'_'+data.key].draw();
        else if(this.viewoption == 'value_heatmap')
            this.value_heatmap_bucket[parent+'_'+data.key].draw();
        else if(this.viewoption == 'bitStackBarChart')
            this.bitStackBarChart_bucket[parent+'_'+data.key].draw();  
        else if(this.viewoption == 'value_stackChart')
            this.valueStack_bucket[parent+'_'+data.key].draw();  
    }

    draw_menu(){
        
        //let x = this.x + this.programtreedata.getTreeHeight() * this.blockw + this.left_padding;
        let x = this.left_padding + this.blockw * 4 + this.padding;
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
        this.draw_annotation_heatmap();
        this.draw_annotation_stackchart();        
    }

    draw_annotation_stackchart(){
        //ratio
        let ratio_chart_x = this.left_padding + this.blockw * 4 + this.padding * 2 + this.bitmap_width;
        this.stackbar_chart_axis = d3.scaleLinear().range([ratio_chart_x, ratio_chart_x + this.stackbar_width]).domain([0, 1]);
        this.stackbar_chart_axis_annotation = this.svg.append('g').attr('class','axis axis--x')
            .attr("transform", "translate(0,"+ (this.top_padding - 20) + ")")
            .call(d3.axisTop(this.stackbar_chart_axis).ticks(5));

        //category annotation
        
        if(this.stackbar_chart_text != undefined)
            this.stackbar_chart_text.remove();
        this.stackbar_chart_text = this.svg.append('g');

        this.stackbar_chart_text.selectAll('.stackbar_chart_text').data(Object.keys(this.outcome_color).sort())
            .enter()
            .append('text')
            .text(d=>d)
            .attr('x', (d, i)=>{
                return ratio_chart_x + this.stackbar_width/1.5;
            })
            .attr('y', (d, i)=>{
                return this.top_padding - 140 + i * 20 + 7.5;
            })
            .attr('dominant-baseline', 'central')
            .style('font-size', 12);

        if(this.stackbar_chart_rect != undefined)
            this.stackbar_chart_rect.remove();
        this.stackbar_chart_rect = this.svg.append('g');

        this.stackbar_chart_rect.selectAll('.stackbar_chart_rect').data(Object.keys(this.outcome_color).sort())
            .enter()
            .append('rect')
            .attr('x', (d, i)=>{
                return ratio_chart_x + this.stackbar_width;
            })
            .attr('y', (d, i)=>{
                return this.top_padding - 140 + i * 20;
            })
            .attr('width', 15)
            .attr('height', 15)
            .style('fill', (d)=>{
                return this.outcome_color[d];
            })
            .classed('tree_node' , true);
    }

    draw_annotation_heatmap(){

        if(this.impactHeatmapAnnotation!=undefined){
            this.impactHeatmapAnnotation.remove();
        }
        
        if(this.bitHeatMapAnnotation != undefined)
            this.bitHeatMapAnnotation.remove();

        if(this.bitHeatMapAnnotation_colorscale != undefined)
            this.bitHeatMapAnnotation_colorscale.remove();

        if(this.smartBitHeatMapAnnotation != undefined)
            this.smartBitHeatMapAnnotation.remove();

        if(this.valueImpactHeatMapAnnotation != undefined)
            this.valueImpactHeatMapAnnotation.remove();

        let colorscale = this.colorscale;
        let colorscale_w = this.bitmap_width/(2 * colorscale.length);
        let colorscale_h = 20;
       
        this.bitHeatMapAnnotation_colorscale = this.svg.append('g');
        this.bitHeatMapAnnotation_colorscale.selectAll('.colorscale').data(colorscale).enter()
        .append('rect')
        .attr('x', (d, i)=>{
            return this.left_padding + this.blockw * 4 + this.padding*2 + this.bitmap_width/3 + colorscale_w * i;
        })
        .attr('y', (d, i)=>{
            return this.top_padding - 85;
        })
        .attr('width', colorscale_w)
        .attr('height', colorscale_h)
        .attr('fill', (d, i)=>{
            return d;
        })
        .style('stroke', 'gray')
        .style('stroke-width', '1px');

        this.bitHeatMapAnnotation_colorscale.selectAll('.colorscale_text').data(['0<','100 %']).enter().append('text')
        .text(d=>d)
        .attr('x', (d, i)=>{
            if(i == 0)
                return  this.left_padding + this.blockw * 4 + this.padding * 2 + this.bitmap_width/3;
            else 
                return this.left_padding + this.blockw * 4 + this.padding * 2 + this.bitmap_width/3 + colorscale_w * this.colorscale.length;
        })
        .attr('y', this.top_padding - 95)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central');


        if(this.viewoption == 'bit_heatmap' || this.viewoption == 'bitStackBarChart'){

            if(this.viewoption == 'bitStackBarChart'){
                this.bitHeatMapAnnotation_colorscale.attr('display', 'none');
                this.bitHeatMapAnnotation_colorscale.attr('display', 'none');
            }

            this.bitHeatMapAnnotation = this.svg.append('g').selectAll('.programTreeViewMenu_annotation').data(['sign', 'exponent', 'mantissa'])
            .enter()
            .append('text')
            .text(d=>d)
            .attr('x', (d, i)=>{
                if(i==0) 
                    return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width/128;
                else if(i == 1)
                    return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width/7;
                else 
                    return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width* 19/32;
            })
            .attr('y', (d, i)=>{
                return this.top_padding - 20;
            }) 
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style('font-size', 10);
        }
        else if(this.viewoption == 'heatmap_impact' ){
            let x = this.left_padding + this.blockw * 4 + this.padding;
            let maxdiff = this.programtreedata.getMaxDiff();
            let mindiff = this.programtreedata.getMinDiff();
            let x_axis = d3.scaleLinear().range([x, x + Math.floor(this.bitmap_width/10) * 10]).domain([mindiff, maxdiff]);

            this.impactHeatmapAnnotation = this.svg.append('g')
            this.impactHeatmapAnnotation.append('text').datum(['Output Distribution']).text(d=>d)
                .attr('x', (d, i)=>{
                    return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width/2;
                })
                .attr('y', (d, i)=>{
                    return this.top_padding - 40;
                })
                .attr('text-anchor', 'middle');
            this.impactHeatmapAnnotation.append('g').attr('class','axis axis--x')
                .attr("transform", "translate(0,"+ (this.top_padding - 20) + ")")
                .call(d3.axisTop(x_axis).tickValues(d3.range(mindiff, maxdiff, (maxdiff - mindiff)/10)));
        }
        else if(this.viewoption == 'smart_bit_heatmap'){
            let lowestbit = this.programtreedata.getLowestProblemBit();
            this.smartBitHeatMapAnnotation = this.svg.append('g').selectAll('.programTreeViewMenu_annotation').data(['sign', 'exponent', 'mantissa', '<'+lowestbit])
            .enter()
            .append('text')
            .text(d=>d)
            .attr('x', (d, i)=>{
                if(i==0) 
                    return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width / ((64 - lowestbit) * 2);
                else if(i == 1)
                    return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width / (64-lowestbit) * 6.5;
                else if(i == 2)
                    return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width / (64 - lowestbit) * 13;
                else if(i == 3)
                    return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width / (64 - lowestbit) * (64 - lowestbit);
            })
            .attr('y', (d, i)=>{
                return this.top_padding - 20;
            }) 
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style('font-size', 10);
        }
        else if(this.viewoption == 'value_heatmap' || this.viewoption == 'value_stackChart'){
            let x = this.left_padding + this.blockw * 4 + this.padding;
            let maxdiff = this.programtreedata.getMaxInput();
            let mindiff = this.programtreedata.getMinInput();
            let x_axis = d3.scaleLinear().range([x, x + this.bitmap_width/11 * 10]).domain([mindiff, maxdiff]);

            this.valueImpactHeatMapAnnotation = this.svg.append('g')
            this.valueImpactHeatMapAnnotation.append('text').datum(['Input Error Distribution']).text(d=>d)
                .attr('x', (d, i)=>{
                    return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width/3;
                })
                .attr('y', (d, i)=>{
                    return this.top_padding - 40;
                });
            
            this.valueImpactHeatMapAnnotation.append('text').datum(['nan']).text(d=>d)
            .attr('x', (d, i)=>{
                return this.left_padding + this.blockw * 4 + this.padding + this.bitmap_width - 5;
            })
            .attr('y', (d, i)=>{
                return this.top_padding - 30;
            })
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central');

            this.valueImpactHeatMapAnnotation.append('g').attr('class','axis axis--x')
                .attr("transform", "translate(0,"+ (this.top_padding - 20) + ")")
                .call(d3.axisTop(x_axis).tickValues(d3.range(mindiff, maxdiff, (maxdiff - mindiff)/10)));
        }
    }

    is_the_node_a_leaf(data){
        return 'key' in data.values[0] && !(data.values[0].key in this.outcome_color);
    }

    setData(msg, data){
        this.programtreedata.setData(data);
        this.callbackBinding();
        this.init();
        this.draw();
    }

    /**
     *  callback binding
     **/
    callbackBinding(){
        this.programtreecontroller.bindingEvent();
        this.programtreecontroller.setNormalizationChangeCallback(this.updateStackChart.bind(this));
        this.programtreecontroller.setTreeStructureChangeCallback(this.treeStructureChangeEvent.bind(this));
        this.programtreecontroller.setfiltercalllback(this.filterData.bind(this));
        this.programtreecontroller.setViewChangeCallback(this.changeViewEvent.bind(this));
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

    treeStructureChangeEvent(pattern){
        this.programtreedata.setHierachicalData(pattern);
        this.draw();
    }

    changeViewEvent(option){

        this.viewoption = option;

        for(let key in this.bit_heatmap_bucket){
            this.impact_heatmap_bucket[key].clear();
            this.value_heatmap_bucket[key].clear();
            this.smart_bit_heatmap_bucket[key].clear();
            this.bit_heatmap_bucket[key].clear();
            this.bitStackBarChart_bucket[key].clear();
            this.valueStack_bucket[key].clear();
        }

        if(option == 'bit_heatmap'){
            for(let key in this.impact_heatmap_bucket){
                this.bit_heatmap_bucket[key].draw();
            }
        }
        else if(option == 'smart_bit_heatmap'){
            for(let key in this.impact_heatmap_bucket){
                this.smart_bit_heatmap_bucket[key].draw();
            }
        }
        else if(option == 'heatmap_impact'){
            for(let key in this.bit_heatmap_bucket){
                this.impact_heatmap_bucket[key].draw();
            }
        }
        else if(option == 'value_heatmap'){
            for(let key in this.bit_heatmap_bucket){
                this.value_heatmap_bucket[key].draw();
            }
        }
        else if(option == 'bitStackBarChart'){
            for(let key in this.bit_heatmap_bucket){
                this.bitStackBarChart_bucket[key].draw();
            }
        }
        else if(option == 'value_stackChart'){
            for(let key  in this.valueStack_bucket){
                this.valueStack_bucket[key].draw();
            }
        }

        this.draw_annotation_heatmap();
    }

    filterData(category, items){
        this.programtreedata.filterDataCallBack(category, items);
        this.draw();
    }
}

