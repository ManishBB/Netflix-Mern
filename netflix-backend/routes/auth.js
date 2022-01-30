const router = require("express").Router()
const User = require("../models/User")
var CryptoJS = require("crypto-js");
const { resetWatchers } = require("nodemon/lib/monitor/watch");
const jwt = require("jsonwebtoken")

//Register
router.post("/register", async (req,res) => {
    const newUser = new User({
        username:req.body.username,
        email:req.body.email,
        password: CryptoJS.AES.encrypt( req.body.password, process.env.SECRETE_KEY).toString(),
    })

    try{
        const user = await newUser.save();
        res.status(201).json(user)
    }
    catch(err){
        res.status(500).json(err)
    }
})

//Login
router.post("/login", async (req,res)=>{
    try{
        const user = await User.findOne({ email: req.body.email})
        !user && res.status(401).json("Wrong Username or Password!")

        var bytes  = CryptoJS.AES.decrypt( user.password , process.env.SECRETE_KEY);
        var originalPassword = bytes.toString(CryptoJS.enc.Utf8);

        originalPassword !== req.body.password && res.status(401).json("Wrong Username or Password!")

        const accessToken = jwt.sign(
            {id: user._id, isAdmin: user.isAdmin},
            process.env.SECRETE_KEY,
            { expiresIn: "5d"}
        )

        const {password, ...info} = user._doc

        res.status(200).json({...info, accessToken})
    }
    catch(err){
        res.status(500).json(err)
    }
})

module.exports = router; 