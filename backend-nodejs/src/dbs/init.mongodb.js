const mongoose = require('mongoose');
const { countConnect } = require('../helpers/check.connect');
const { db: { port, name, host } } = require('../configs/config.mongodb');
const connectString = `mongodb://${host}:${port}/${name}`;

class Database {
    constructor() {
        this.connect();
    }

    connect() {
        mongoose.set('debug', true);
        mongoose.set('debug', { color: true });

        mongoose.connect(connectString, {
            maxPoolSize: 5
        }).then(() => {
            console.log(`Connected to MongoDB successfully`, countConnect());
        }).catch(err => {
            console.error(`Connect Error`, err);
            process.exit(1);
        });

        mongoose.connection.on('error', err => {
            console.error(`[${new Date(Date.now()).toUTCString()}] - ${err.name}: ${err.message}`);
        });

        mongoose.connection.on('connected', () => {
            console.log(`[${new Date(Date.now()).toUTCString()}] - Mongoose Info: Database connection established`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log(`[${new Date(Date.now()).toUTCString()}] - Mongoose Info: Database connection closed`);
        });
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    static async disconnect() {
        await mongoose.connection.close();
    }
}

const instanceMongoDB = Database.getInstance();
module.exports = instanceMongoDB;
module.exports.disconnect = Database.disconnect;
