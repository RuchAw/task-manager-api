const express=require("express")
const User=require("../models/user")
const auth= require("../middleware/auth")
const multer=require("multer")
const sharp=require("sharp")
const {sendWelcomeEmail, sendCancelEmail}= require("../emails/account")
const router= new express.Router()


router.post("/users",async (req,res)=>{
    const user= new User(req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(error){
        res.status(400).send(error)
    }
})

router.post("/users/login", async (req,res)=>{
    try{
        const user= await User.findByCredentials(req.body.email,req.body.password)
        const token= await user.generateAuthToken()
        res.send({user, token})

    }catch(error){
        res.status(400).send(error)
    }
})


router.post("/users/logout", auth, async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    }catch(error){
        res.status(500).send()
    }
})

router.post("/users/logoutALL", auth, async (req,res)=>{
    try{
        req.user.tokens=[]

        await req.user.save()

        res.send()
    }catch(error){
        res.status(500).send()
    }
})


router.get("/users/me",auth,async (req,res)=>{

    res.send(req.user)
    
    })

// router.get("/users/:id",async (req,res)=>{
//     const _id=req.params.id
//     try{
//         const user= await User.findById(_id)
//         if (!user) return res.status(404).send()
//         res.send(user)

//     }catch(error){
//         res.status(500).send()
//     }

// })

// router.get("/users",async (req,res)=>{

//     try{
//         const users= await User.find({})
//         res.send(users)
//     }catch(error){
//         res.status(500).send()
//     }
// })



router.patch("/users/me",auth,async (req,res)=>{

    const updates= Object.keys(req.body)
    const allowedUpdates = ["name", "email", "password", "age"]
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))

    if (!isValidOperation) return res.status(400).send({error: "Invalid Updates"})

    try{
        
        updates.forEach((update)=>{
            req.user[update]= req.body[update]
        })

        await req.user.save()
        
        //const user= await User.findByIdAndUpdate(req.params.id,req.body,{ new: true, runValidators: true })

        // if (!user) return res.status(404).send()

        res.send(req.user)

    }catch(error){
        res.status(500).send()
    }
})

router.delete("/users/me",auth,async (req,res)=>{
    try{ 
        // user= await User.findByIdAndDelete(req.user._id)

        // if (!user) return res.status(404).send()

        await req.user.remove()
        res.send(req.user)
        sendCancelEmail(req.user.email,req.user.name)

    }catch(error){
        res.status(500).send()
    }
})

const upload= multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb){

        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return cb(new Error("Please upload an image jpg,jpeg or png"))
        }
        cb(undefined,true)
    }

})

router.post("/users/me/avatar", auth, upload.single("avatar"), async (req,res)=>{
    const buffer= await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

router.delete("/users/me/avatar", auth, async (req,res)=>{

    if (!req.user.avatar) return res.status(500).send("There is no avatar to remove")

    req.user.avatar= undefined

    await req.user.save()

    res.send()
})


router.get("/users/:id/avatar", async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set("Content-Type","image/png")
        res.send(user.avatar)

    }catch(error){
        res.status(400).send()
    }
})

module.exports= router