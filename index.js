//Import key modules
require("node-env-file")(`${__dirname}/.env`);

const redis = require("redis");
const createServer = require("./src/server");
const {promisify} = require("util");

const start = async () => {

    //Initializing server
    const server = await createServer(
        {
            port: process.env.PORT,
            host: process.env.HOST
        },
        {
            enableSSL: process.env.SSL === "true"
        },
    );

    //Initalize Redis client server
    const redisClient = redis.createClient(
        {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        }
    );

    //Make redis functions asynchronous
    redisClient.lpushAsync = promisify(redisClient.lpush).bind(redisClient);
    redisClient.lrangeAsync = promisify(redisClient.lrange).bind(redisClient);
    redisClient.llenAsync = promisify(redisClient.llen).bind(redisClient);
    redisClient.lremAsync = promisify(redisClient.lrem).bind(redisClient);
    redisClient.lsetAsync = promisify(redisClient.lset).bind(redisClient);


    //Start redis server
    redisClient.on("error", err => {
        console.error(`Redis error: ${err}`);
    });

    //Attach redis server to application to have access to it in the routes
    //to store and retrieve data

    server.app.redis = redisClient;

    //Start server
    await server.start();

    console.log(`Server runnning at: ${server.info.uri}`);
    console.log(`Server docs running on ${server.info.uri}/docs`);

};


//Log errors if any
process.on("unhandledRejection", err => {
    console.log(err);
    process.exit(1);
});

//Begin server creation process
start();