const express=require('express');
const userrouter = require('./routers/user');
const userrouter1 = require('./routers/task');
require('./db/mongoose');

const app=express();

app.use(express.json());
app.use(userrouter); 
app.use(userrouter1); 

module.exports=app;


// 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