require("dotenv").config();

module.exports = {
    "development": {
        "username": process.env.DB_USERNAME,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_DATABASE,
        "host"    : process.env.DB_HOST,
        "dialect" : "mysql",
        // "logging": console.log,
        logging: false
    },
    test         : {
        dialect: "sqlite",
        storage: "tests/database.sqlite",
        logging: false
    },
    "production" : {
        "username": process.env.DB_USERNAME,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_DATABASE,
        "host"    : process.env.DB_HOST,
        "dialect" : "mysql"
    }
};
