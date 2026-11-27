const{startApplication}=require('./runtime.cjs');
startApplication().catch(()=>{require('electron').app.quit();});
