class ErrorPropagationView extends BasicView{
    constructor(container){
        super(container);
        this.propagationData = new ErrorPropagationData();
    }

    init(data){
        super.init();

        this.blockw = 80;
        this.blockh = 30;

        this.y = this.top_padding = 150;
        this.x = this.left_padding = 150;
        this.padding = 20;
        this.propagationData.setData(data);

        d3.select('#ErrorPropagationView').html('');
        this.svg = d3.select('#ErrorPropagationView').append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.variableViewBucket = [];
        ///init each variable view's and data
        this.propagationData.seqVar.forEach(d=>{
            let view = new SingleVariableView(this.svg, d);

            view.setData(this.propagationData.getGolden_Error_SequenceValue(d));
             
            this.variableViewBucket.push(view);
        });

        //timer 
        this.timer = new Timer(this.svg, this.variableViewBucket[0].getMaxTimeStep());
            //timer step change event
        this.timer.setTimerStepChangeCallBack(this.setTimerChangeEvent.bind(this));

        //controller 
        this.propagationController = new ErrorPropagationController();
        this.propagationController.set_change_Relative_And_Absolute_Option_callback(this.draw.bind(this));
    }

    setTimerChangeEvent(time){

        this.variableViewBucket.forEach(view=>{
            view.setTimerStep(time);
        });

        publish('SOURCECODE_HIGHLIGHT', this.propagationData.getProgramCurrentExecutedLine(time));
    }

    setData(msg, data){
        this.init(data);
        this.draw();
    }

    setGoldenRunData(msg, data){
        this.propagationData.setGoldenRunData(data);
    }

    draw(){

        //clean svg
        this.svg.html('');

        this.variableViewBucket.forEach((view, i)=>{
            view.setX(this.x);
            view.setY(this.y + i * (view.getRectHeight() + view.getPadding()));
            view.setErrorOption(this.propagationController.getOption());
            view.draw();
        });

        //timer
        this.timer.setX(this.x);
        this.timer.setY(this.y - this.top_padding/2);
        this.timer.draw();
    

        //if the propagation view is large than the computer screen view,
        //reset the size of svg 
        let currentheight = this.y + (this.variableViewBucket[0].getRectHeight() + this.variableViewBucket[0].getPadding()) * this.propagationData.seqVar.length;
        if(currentheight > this.height){
            this.svg.attr('height', currentheight + this.variableViewBucket[0].getPadding() * 2);
        }
    }
}