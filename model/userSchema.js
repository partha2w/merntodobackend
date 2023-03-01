const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error ("not valid email")
            }
        }
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    items:[
        {
            type:String
        }
    ],  
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
});

//--------------------password Hashing "bcryptjs"------------

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
        this.cpassword = await bcrypt.hash(this.cpassword,10);
    }
    next();
});

// -----------------Generating Token--------------

userSchema.methods.generateAuthToken = async function(){
    try{

        let newToken = jwt.sign({_id:this._id},SECRET_KEY,{expiresIn:"7d"});
        this.tokens = this.tokens.concat({token:newToken});
        await this.save();
        return newToken;

    }catch (err){
        console.log("error on token generate"+err);
    }
}

const User = new mongoose.model("User",userSchema);

module.exports = User;