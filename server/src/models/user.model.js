import mongoose, {Schema} from "mongoose"
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"


const userSchema = new Schema({
    username:{
        type: String,
        required:true,
        unique : true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type: String,
        required:true,
        unique : true,
        lowercase:true,
        trim:true
    },
    
    password:{
         type: String, 
         required:[true,"Password is Required"]
    },

    refreshToken:{
        type:String
    },
    isAdmin:{
        type:Boolean,
        required:true,
        default:false
    },
    classTimetable:{
        type: Object,
        default:null
    },
    score:{
        type: Number,
        default:0
    },


},
{
timestamps:true
})

const teacherSchema = new Schema({
    username:{
        type: String,
        required:true,
        unique : true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type: String,
        required:true,
        unique : true,
        lowercase:true,
        trim:true
    },
    
    password:{
         type: String, 
         required:[true,"Password is Required"]
    },

    refreshToken:{
        type:String
    },
    isAdmin:{
        type:Boolean,
        required:true,
        default:false
    },
    classes:{
        type: Array,
        default:null
    },


},
{
timestamps:true
})
userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){ 
    return  jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    }, process.env.ACCESS_TOKEN_SECRET, // Create ACCESS_TOKEN_SECRET in env file
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
    })
}
userSchema.methods.generateRefreshToken = function(){
    return  jwt.sign({
        _id:this._id,
    }, process.env.REFRESH_TOKEN_SECRET,  // create REFRESH_TOKEN_SECRET in env file
     {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
    })
}

teacherSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

teacherSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

teacherSchema.methods.generateAccessToken = function(){ 
    return  jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    }, process.env.ACCESS_TOKEN_SECRET, // Create ACCESS_TOKEN_SECRET in env file
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
    })
}
teacherSchema.methods.generateRefreshToken = function(){
    return  jwt.sign({
        _id:this._id,
    }, process.env.REFRESH_TOKEN_SECRET,  // create REFRESH_TOKEN_SECRET in env file
     {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
    })
}




export const User = mongoose.model("User", userSchema)
export const Teacher = mongoose.model("Teacher", teacherSchema)
