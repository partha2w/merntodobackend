const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../model/userSchema");
const router = new express.Router();
const authenticate = require("../middleware/authenticate");

// ----------------------register User here----------------
router.post("/register", async (req, res) => {

    const { name, email, password, cpassword } = req.body;

    if (!name || !email || !password || !cpassword) {
        return res.status(412).json({ error: "please fill the input details" })
    }

    try {

        const preUser = await User.findOne({ email: email });
        if (preUser) {
            return res.status(409).json({ error: "email already exist" })
        } else if (password !== cpassword) {
            return res.status(422).json({ error: "password not matched" })
        } else {
            const finalUser = new User({ name, email, password, cpassword });
            const storedData = await finalUser.save();
            return res.status(201).json(storedData);
        }

    } catch (err) {
        console.log(err);
    }

});

// ----------------------------Login User here------------

router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(412).json({ error: "please fill the input details" })
    }

    try {

        const foundUser = await User.findOne({ email: email });
        if(!foundUser){
            return res.status(422).json({error:"invalid Credentials"})
        }else if (foundUser) {
            const isMatch = await bcrypt.compare(password, foundUser.password);
            if (!isMatch) {
                return res.status(422).json({ error: "invalid Credentials" })
            } else {
                const token = await foundUser.generateAuthToken();

                res.cookie("todocookie", token, {
                    expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
                    httpOnly: true,
                    secure: true // set the "secure" flag if using HTTPS
                });

                return res.status(201).json(token);
            }
        }

    } catch (err) {
        console.log(err);
    }

});

// ---------------------------------ValidUser API----------

router.get("/validuser",authenticate,async(req,res)=>{

    try {
        
        const validUser = await User.findOne({_id:req.userId})
        if(!validUser){
            return res.status(401).json({error:"user not valid"});
        }else if(validUser){
            return res.status(200).json(validUser);
        }

    } catch (error) {
        console.log(error);
    }
    
});

// -----------------------------Logout Api-----------

router.get("/logout",authenticate,async(req,res) => {
    try {

        //remove token from db
        req.rootUser.tokens = req.rootUser.tokens.filter((currentVal)=>{
            return currentVal.token !== req.token
        });

        //remove cookie from browser
        res.clearCookie("todocookie",{path:"/"});

        req.rootUser.save();
        return res.status(200).json({message:"user logout succesfully"})
        
    } catch (error) {
        return res.status(401).json({error});
    }
});

// -------------adding Todolist Item API----------
router.post("/todolist/add",(req,res)=>{
    const {inputval,userId} = req.body;

        
        User.findOne({_id:userId},(err,foundUser)=>{
            if (err) {
                return res.status(422).send(err);
            }
            foundUser.items.push(inputval);
            foundUser.save((err)=>{
                if(err){
                    return res.status(422).send(err);
                }
                return res.status(200).json({message:"item Saved"});
            })
        })
        
});

//-------------deleting Todolist Item API---------------

router.delete("/todolist/delete/:index",(req,res)=>{
    const itemIndex = req.params.index;
    const {userId} = req.body;


    User.findOne({_id:userId},(err,foundUser)=>{
        if(err) {
            return res.status(422).send(err);
        }

        foundUser.items.splice(itemIndex,1);
        foundUser.save((err)=>{
            if(err){
                return res.status(422).send(err);
            }
            res.send({success:true});
        })
    });
    
});

module.exports = router;