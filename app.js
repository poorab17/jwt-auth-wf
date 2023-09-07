const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
require("dotenv").config();
const AuthRoute = require("./Routes/Auth.route")
require("./helpers/init_mongodb");
require("./helpers/init_redis");
const {verifyAccessToken}= require("./helpers/jwt_helper")


// redis.set("foo","bar");
// redis.get("foo",(err,value)=>{
// if(err) console.log(err.message)
// console.log(value)
// })
const app = express();
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const port= process.env.PORT ||3000                                                                                                                                                                                

app.get("/",verifyAccessToken,async(req,res,next)=>{
res.send("hello from express")
})


app.use("/auth",AuthRoute);

app.use(async(req,res,next)=>{
// const error = new Error("not found");
// error.status =404;
// next(error);
next(createError.NotFound("this route doesnot exist"));
})

app.use((err,req,res,next)=>{
res.status(err.status||500)
res.send({
    error:{
        status:err.status||500,
        message:err.message,
    },
})
})


app.listen(port,()=>{
console.log(`listnening on port ${port}`);
})