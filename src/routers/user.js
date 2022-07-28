const express=require('express');
const bcrypt=require('bcrypt');
const User=require('../models/user');
const auth=require('../middleware/auth');
const multer=require('multer');
const sharp=require('sharp');
// const {sendWelcomeEmail,sendGoogByeEmail}=require('../emails/account');

const router=new express.Router();

router.post('/users', async (req,res)=>{
    const user=new User(req.body);
    try{
        await user.save();
//         sendWelcomeEmail(user.email,user.name);
        const token=await user.generateToken();
        res.status(201).send({user,token});
    }catch(e){
        res.status(500).send(e);
    }
});

router.post('/users/login', async (req,res)=>{
    try{
        const user=await User.findByCredentials(req.body.email,req.body.password);
        if(!user) throw new Error();
        const token=await user.generateToken();
        res.send({user,token});
    }catch(e){
        res.status(500).send({error:'invalid credentials'});
    }
});

router.post('/users/logout',auth,async (req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((ele)=>req.token!==ele.token);
        await req.user.save();
        res.send(req.user);
    }catch(e){
        res.status(500).send();
    }
});

router.post('/users/logoutall', auth , async (req,res)=>{
    try{
        req.user.tokens=[];
        await req.user.save();
        res.send(req.user);
    }catch(e){
        res.status(500).send();
    }
})

router.get('/users/me', auth ,async (req,res)=>{
        res.send(req.user);
});


router.patch('/users/me', auth ,async (req,res)=>{
    const update=Object.keys(req.body);
    const allowed=['name','password','email','age'];
    const isValid=update.every((ele)=>allowed.includes(ele));
    if(!isValid) return res.status(404).send({'error':'invalid update'});

    try{
        update.forEach((ele)=>req.user[ele]=req.body[ele]);
        await req.user.save();
        res.send(req.user);
    }catch(e){
        res.status(500).send(e);
    }
});

router.delete('/users/me', auth ,async (req,res)=>{
    try{
        await req.user.remove();
//         sendGoogByeEmail(req.user.email,req.user.name);
        res.status(200).send(req.user);
    }catch(e){
        res.status(500).send(e);
    }
});

// const upload=multer({
//     limits:{
//         fileSize:1000000
//     },
//     fileFilter(req,file,cb){
//         if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) return cb(new Error('Plase upload image'));

//         cb(undefined,true);
//     }
// });


// router.post('/users/me/avatar', auth, upload.single('avatar'), async  (req,res)=>{
//     const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
//     req.user.avatar=buffer;
//     await req.user.save();
//     res.send();
// },(error,req,res,nexr)=>{
//     res.status(400).send({error:error.message});
// });

// router.delete('/users/me/avatar', auth , async (req,res)=>{
//     try{
//         if(!req.user.avatar) return res.status(404).send();
//         req.user.avatar=undefined;
//         await  req.user.save();
//         res.send();
//     }catch(e){
//         res.status(400).send();
//     }
// });

// router.get('/users/:id/avatar', async (req,res)=>{
//     try{
//         const user=await User.findById(req.params.id);
//         if(!user || !user.avatar) throw new Error();

//         res.set('Content-Type','image/png');
//         res.send(user.avatar);

//     }catch(e){
//         res.status(404).send();
//     }
// });

module.exports=router;
