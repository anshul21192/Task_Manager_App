const express=require('express');
const Task=require('../models/tasks');
const auth=require('../middleware/auth');
const router=new express.Router();

router.post('/tasks', auth ,async (req,res)=>{
        const task= new Task({
            ...req.body,
            owner:req.user._id
        });
        try{
            await task.save();
            res.send(task);
        }catch(e){
            res.status(400).send({error:'invalid task'});
        }
});

router.get('/tasks', auth , async (req,res)=>{
        const match={};
        const sort={};

        if(req.query.completed){
            match.completed=req.query.completed==='true';
        }

        if(req.query.sortBy){
            const parts=req.query.sortBy.split(':');
            sort[parts[0]]=parts[1]==='desc'?-1:1;
        }

        try{
            await req.user.populate({
                path:'tasks',
                match,
                options:{
                    limit:parseInt(req.query.limit),
                    skip:parseInt(req.query.skip),
                    sort
                }
            })
            res.send(req.user.tasks);
        }catch(e){
            res.status(500).send('error');
        }
});

router.get('/tasks/:id', auth , async (req,res)=>{
    try{
            const task=await Task.findOne({_id:req.params.id,owner:req.user._id});
            if(!task) return res.status(404).send();
            res.status(200).send(task);
        }catch(e){
            res.status(500).send('invalid id');
        }
});

router.patch('/tasks/:id', auth , async (req,res)=>{
        const update=Object.keys(req.body);
        const allow=['description','completed'];
        const isMatch=update.every((ele)=>allow.includes(ele));
        if(!isMatch) res.status(404).send('invalid update');

        try{
            const task=await Task.findOne({_id:req.params.id,owner:req.user._id});
            if(!task) return res.status(404).send();
            update.forEach((ele)=>task[ele]=req.body[ele]);
            await task.save();
            res.send(task);
        }catch(e){
            res.status(500).send('error');
        }
});

router.delete('/tasks/:id', auth , async (req,res)=>{
        try{
            const task=await Task.findOneAndDelete({ _id:req.params.id,owner:req.user._id});
            if(!task) return res.status(404).send();
            res.send(task);
        }catch(e){
            res.status(500).send();
        }
});

module.exports=router;