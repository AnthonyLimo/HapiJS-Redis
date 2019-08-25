//Import key modules
const Joi =  require("joi");
const Boom = require("boom");

//Code as configuration at its best
module.exports = {
    //Setting the http method, path, options and handler
    method: "DELETE",
    path: "/todo",
    //Setting auth mechanism and payload validation as well as tags and descriptions of the module function
    options: {
        auth: "jwt",
        validate: {
            payload: {
                item: Joi.number().min(0).required().notes("Index to delete")
            }
        },
        description: "Delete item",
        notes: "Delete an item from the to do  list",
        tags: ["api"]
    },
    handler: async (request, h) => {
        //Send in credentials and values for auth, payload
        let {sub: redispath} = request.auth.credentials;
        let {index: redisindex} = request.payload;
        let {redis} = request.server.app;

        //Find specified index
        //With Redis, you overwrite it and then delete the key value pair
        try {
            await redis.lsetAsync(redispath, redisindex, "__DELETE__");
            await redis.lremAsync(redispath, 1, "__DELETE__");

            //Respond with OK
            return h.response({}).code(200);
        } catch(e) {
            //Tell us if something has gone wrong
            return Boom.badImplementation(e);
        }
    }
};