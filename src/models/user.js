const validator=require('validator');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken')
const mongoose=require('mongoose');
const Task=require('./tasks');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    age:{
        type:Number,
        default:5,
        validate(res){
            if(res<0) throw new Error('wrong age');
        }
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(res){
            if(!validator.isEmail(res)) throw new Error('invaild email');
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minLength:8,
        validate(res){
            if(res.includes('password')) throw new Error('change password');
        }
    },
    tokens:[
        {
            token:{
            type:String,
            trim:true,
            required:true,
        },
    }
    ],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
});

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
});

userSchema.methods.toJSON= function(){
    const user=this;
    const userObj=user.toObject();
    delete userObj.password;
    delete userObj.tokens;
    delete userObj.avatar;
    return userObj;
}

userSchema.methods.generateToken=async function(){
    const user=this;
    const token=await jwt.sign({_id:user._id.toString()},process.env.secretcode);
    user.tokens.push({token});
    await user.save();
    return token;
}

userSchema.statics.findByCredentials= async function(email,password){
    const user=await User.findOne({email});
    if(!user) { throw new Error('unable to login');}
    const match=await bcrypt.compare(password,user.password);
    if(!match){ throw new Error('unable to login');}
    return user;
}

userSchema.pre('save', async function(next){
    const user=this;
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8);
    }
    next();
});

userSchema.pre('remove',async function(next){
    const user=this;
    await Task.deleteMany({owner:user._id});
    next();
});

const User=mongoose.model('User',userSchema);


module.exports=User;