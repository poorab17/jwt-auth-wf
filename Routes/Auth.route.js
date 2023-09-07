const express = require("express");
const router = express.Router()
const createError = require("http-errors")
const User = require("../Models/User.Model")
const {authSchema} =require("../helpers/validation.schema")
const {signAccessToken,signRefreshToken, verifyAccessToken,verifyRefreshToken}=require("../helpers/jwt_helper");
const {redis}=require("../helpers/init_redis")



router.post("/register", async(req,res,next)=>{
// res.send("register router")
// console.log(req.body);
try {
   // const {email,password} = req.body;
   // if(!email ||!password)throw createError.BadRequest()
    const result = await authSchema.validateAsync(req.body);
   //console.log(result);

   const doesExist= await User.findOne({email:result.email})
   if(doesExist)throw createError.Conflict(`${result.email} is already been registered`)
   
   const user = new User(result)
   const SavedUser = await user.save();
   console.log("inserted in mongoDB")
   
   const accessToken = await signAccessToken(SavedUser.id)
   const refreshToken = await signRefreshToken(SavedUser.id)
   res.send({accessToken,refreshToken});
} catch (error) {
    if(error.isJoi=== true) error.status=422
    next(error)
}
})

router.post("/login",async(req,res,next)=>{
//res.send("login router")

try {
    const result = await authSchema.validateAsync(req.body);
     const user = await User.findOne({email:result.email})

     if(!user) throw createError.NotFound("user not registered")
     const isMatch = await user.isValidPassword(result.password);
    if(!isMatch) throw createError.Unauthorized("username/password is not valid")
     const accessToken=await signAccessToken(user.id) 
    const refreshToken = await signRefreshToken(user.id)
   res.send({accessToken,refreshToken});
    
} catch (error) {
    if(error.isJoi===true) return next(createError.BadRequest("invalid username/password"))
    next(error)
}
})

router.post("/refresh-token",async(req,res,next)=>{
//res.send("refresh token  route")
try {
    const {refreshToken} = req.body;
    if(!refreshToken)throw createError.BadRequest()
   const userId = await verifyRefreshToken(refreshToken);
     const accessToken=await signAccessToken(userId) 
    const refreshedToken = await signRefreshToken(userId);
    res.send({accessToken,refreshedToken});
} catch (error) {
    next(error);
}

})

router.delete("/logout",async(req,res,next)=>{
//res.send(" logout router")

try {
    const {refreshToken}=req.body;
    if(!refreshToken)throw createError.BadRequest()
    const userId=await verifyRefreshToken(refreshToken)
    redis.del(userId,(err,value)=>{
if(err){
    console.log(err.message);
    throw createError.InternalServerError()
}
console.log(value)
res.sendStatus(204);
    })
    
} catch (error) {
    next(error)
}
})


module.exports= router;