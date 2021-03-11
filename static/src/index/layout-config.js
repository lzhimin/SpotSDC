let config = {
    content: [{
        type: 'row',
        content: [{
            type: 'stack',
            width: 55,
            content: [{
                type: 'component',
                componentName: 'ProgramTreeView',
                title: 'ProgramTreeView'
            }, {
                type: 'component',
                componentName: 'ErrorPropagationView',
                title: 'ErrorPropagationView'
            }, {
                type: 'component',
                componentName: 'TableView',
                title: 'Tableview'
            }]
        }, {
            type: 'stack',
            content: [{
                type: 'component',
                componentName: 'faultToleranceBoudanryView',
                title: 'FaultTolerance'
            }, {
                type: 'component',
                componentName: 'SourceCodeView'
            }, {
                type: 'component',
                componentName: 'ScatterPlot',
                title: 'ScatterPlot'
            }]
        }]
    }]
};