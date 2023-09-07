const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const redis =require("./init_redis")


module.exports={
    signAccessToken:(userId)=>{
    return new Promise((resolve,reject)=>{
     const payload={
        name:"deep"
     }
     const secret=process.env.ACCESS_TOKEN_SECRET
     const options ={
        expiresIn:"1h",
        issuer:"mypage.com",
        audience:userId,
     }
     JWT.sign(payload,secret,options,(err,token)=>{
        if(err){
            console.log(err.message);
            return reject(createError.InternalServerError())
        }
        redis.set(userId,token,'EX',365*24*60*60,(err,reply)=>{
            if(err){
                console.log(err.message)
             reject(createError.InternalServerError())
             return
            }
            resolve(token)
        })
        
     })
    })
    },

    verifyAccessToken:(req,res,next)=>{
        if(!req.headers['authorization']) return next(createError.Unauthorized())
        const authHeader = req.headers['authorization']
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]
        JWT.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,payload)=>{
            if(err){
                if(err.name==='jsonWebTokenError'){
                return next(createError.Unauthorized())
                }else{
               return next(createError.Unauthorized(err.message))
                }
                
            }
            req.payload=payload;
            next();
        })

    },
    signRefreshToken:(userId)=>{
    return new Promise((resolve,reject)=>{
     const payload={
        name:"deep"
     }
     const secret=process.env.REFRESH_TOKEN_SECRET
     const options ={
        expiresIn:"1y",
        issuer:"mypage.com",
        audience:userId,
     }
     JWT.sign(payload,secret,options,(err,token)=>{
        if(err){
            console.log(err.message);
            return reject(createError.InternalServerError())
        }
        resolve(token)
     })
    })
    },
    verifyRefreshToken:(refreshToken)=>{
        return new Promise((resolve,reject)=>{
          JWT.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,payload)=>{
            if(err) return reject(createError.Unauthorized())
            const userId =payload.aud
            redis.get(userId,(err,result)=>{
                if(err){
                    console.log(err.message)
                    reject(createError.InternalServerError())
                    return
                }
                if(refreshToken===result) return resolve(userId)
                reject(createError.Unauthorized())

            })

           // resolve(userId)
          })
        })

    }
}