const redis = require("redis")
  .createClient({ legacyMode: true });

  (async () => {
    await redis.connect();
})();

redis.on("connect", function () {
  console.log("connected to redis!");
});

redis.on("ready",()=>{
 console.log("client connected to redis and ready to use")
})

redis.on("error",(err)=>{
 console.log(err.message)
})


redis.on("end",()=>{
 console.log("client disconnected from redis")
})

process.on("SIGINT",()=>{
    redis.quit();
})

module.exports = redis;