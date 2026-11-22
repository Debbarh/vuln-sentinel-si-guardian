const{http,dialogs}=require('./fixture.cjs');
require('../build/runtime.cjs').startApplication({dataDirectory:process.env.CS_DESKTOP_QA_DATA,http,dialogs}).catch(()=>{require('electron').app.quit();});
