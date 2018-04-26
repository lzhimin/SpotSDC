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
        }]
    },{
          type: 'column',
          content:[{
              type: 'component',
              componentName: 'TableView'
          },{
              type: 'component',
              componentName: 'SourceCodeView'
          }]
      }]
  }]
};