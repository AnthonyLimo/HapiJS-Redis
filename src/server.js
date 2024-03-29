const Hapi = require("hapi");
const jwksRsa = require("jwks-rsa");

const validateFunc = async decoded => {
    return{
        isValid: true,
        credentials: decoded
    };
};

module.exports = async (serverOptions, options) => {
    const server = Hapi.server(
        //Creating default options for server
        //creation
        Object.assign({
            port: 3001,
            host: "localhost",
            routes: {
                cors: {
                    origin: ["*"]
                },
            },
        }, serverOptions)
    );

    //Enable SSL if enable SSL is set to true during
    //configuration
    if (options.enableSSL) {
        console.log("Setting SSL");
        await server.register({plugin: require("hapi-require-https")});
    } else {
        console.log("Not setting SSL");
    }

    //Configuring plugins
    await server.register([
        require("vision"),
        require("inert"),
        {
            plugin: require("lout"),
            options: {
                endpoint: "/docs"
            },
        },
        {
            plugin: require("good"),
            options: {
                ops: {
                    interval: 1000,
                },
                reporters: {
                    consoleReporter: [
                        {
                            module: "good-squeeze",
                            name: "Squeeze",
                            args: [{response: "*"}]
                        },
                        {
                            module: "good-console",
                        },
                        "stdout"
                    ]
                }
            },
        }
    ]);

    //Securing the server using JWT strategy
    await server.register(require("hapi-auth-jwt2"));

    server.auth.strategy("jwt", "jwt", {
        complete: true,
        key: jwksRsa.hapiJwt2KeyAsync({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: `https:${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
        }),
        verifyOptions: {
            audience: process.env.AUTH0_AUDIENCE,
            issuer: `https://${process.env.AUTH0_DOMAIN}`,
            algorithms: ['RS256']
        },
        validate: validateFunc,
    });

    server.auth.default("jwt");

    //Defining routes/endpoints
    server.route(require("./routes"));

    return server;
};