let config = {
  content: [{
      type: 'row',
    content:[{
      type: 'stack',
      width: 60,
      content:[{
            type: 'component',
            componentName: 'ProgramTreeView',
            title:'ProgramTreeView'
        },{
            type: 'component',
            componentName: 'ErrorPropagationView',
            title:'ErrorPropagationView'
        },{
            type: 'component',
            componentName: 'TableView',
            title:'Tableview'
        },{
            type: 'component',
            componentName: 'ResiliencyView',
            title:'Resiliency'
        }]
    },{
        type: 'column',
         content:[{
            type: 'component',
            componentName: 'SourceCodeView'
        },{
            type: 'component',
            componentName: 'ScatterPlot',
            title:'ScatterPlot'
        }]
      }]
  }]
};