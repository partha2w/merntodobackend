const  jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const SECRET_KEY = process.env.SECRET_KEY;

const authenticate =async (req,res,next)=>{
    try {
        
        const token = req.headers.authorization;
        const verifytoken = jwt.verify(token,SECRET_KEY);

        const rootUser = await User.findOne({_id:verifytoken._id});
        if(!rootUser){
            throw new Error("user not found")
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser._id;

        next();

    } catch (error) {
        res.status(401).send({error:"Unauthorized"});
    }
};

module.exports = authenticate;