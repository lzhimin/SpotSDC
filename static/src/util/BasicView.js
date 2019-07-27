class BasicView{

    constructor(container){
        this.container = container;
        //set container div overflow:auto 
        d3.select(container.getElement()[0]).style('overflow', 'auto');
    }

    draw(){

    }

    init(){
        this.width = this.container.getElement().width();
        this.height = this.container.getElement().height() - 20; 
        this.margin = {"left": 50, "right": 50, "top":50, "bottom":50};
    }


    resize(){
        this.width = this.container.getElement().width();

        this.height = this.container.getElement().height() - 20;

        this.draw();
    }

    setData(){
        
    }


}