class FaultToleranceBoudanryControl extends BasicView {
    constructor(container) {
        super(container);

        this.init();
    }

    init() {

        //change event
        $("#fault_tolerance_boundary_view_percentage").change(() => {
            let percentage = $("#fault_tolerance_boundary_view_percentage").val();
            publish("fault_tolerance_view_percentage", percentage);
        });
    }
}