// const app=require('./app');

const express=require('express');
const userrouter = require('./routers/user');
const userrouter1 = require('./routers/task');
require('./db/mongoose');

const app=express();

app.use(express.json());
app.use(userrouter); 
app.use(userrouter1); 

const port=3000;
app.listen(port,()=>{
    console.log('listening port on',port);
});
