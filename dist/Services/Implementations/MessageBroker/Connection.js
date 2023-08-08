"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqp = __importStar(require("amqplib"));
const Configs_1 = require("../../../Utilities/Configs");
class RabbitMQConfig {
    // private static instance: RabbitMQConfig | null = null;
    connection;
    constructor() {
        this.connection = null;
        this.createRabbitMQConnection()
            .then((connection) => {
            this.connection = connection;
        })
            .catch((error) => {
            console.error("Error creating RabbitMQ connection", error);
        });
    }
    // static getInstance(): RabbitMQConfig {
    //   if (!RabbitMQConfig.instance) {
    //     RabbitMQConfig.instance = new RabbitMQConfig();
    //   }
    //   return RabbitMQConfig.instance;
    // }
    async createRabbitMQConnection() {
        try {
            // if (!this.connection) {
            console.log("Connecting to RabbitMQ");
            this.connection = await amqp.connect({
                hostname: Configs_1.Host,
                username: Configs_1.Username,
                password: Configs_1.Password,
                port: Configs_1.Port,
                vhost: Configs_1.Virtual,
            });
            console.log("Connected to RabbitMQ");
            return this.connection;
        }
        catch (error) {
            console.error("Error connecting to RabbitMQ", error);
            throw error; // rethrow the error to handle it outside the class if needed
        }
    }
}
exports.default = RabbitMQConfig;
//# sourceMappingURL=Connection.js.map