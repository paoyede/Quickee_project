"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Configs_1 = require("../../../Utilities/Configs");
class Producer {
    connection;
    channel;
    constructor(connection) {
        this.connection = connection;
        this.channel = null;
        this.createChannel();
    }
    createChannel() {
        if (!this.connection) {
            throw new Error("RabbitMQ connection is not established.");
        }
        this.connection
            .createChannel()
            .then((channel) => {
            this.channel = channel;
            this.configureChannel();
        })
            .catch((error) => {
            console.error("Error creating channel", error);
        });
    }
    configureChannel() {
        if (!this.channel) {
            throw new Error("RabbitMQ channel is not created.");
        }
        const exchangeName = Configs_1.QNExchange;
        this.channel
            .assertExchange(exchangeName, "topic")
            .then(() => {
            return this.channel.assertQueue(Configs_1.QNotification, {
                durable: false,
                exclusive: false,
                autoDelete: false,
            });
        })
            .then(() => {
            return this.channel.bindQueue(Configs_1.QNotification, exchangeName, Configs_1.QNRoutingKey);
        })
            .then(() => {
            this.channel.prefetch(1);
        })
            .catch((error) => {
            console.error("Error configuring channel", error);
        });
    }
    publishMessage(message) {
        if (!this.channel) {
            throw new Error("RabbitMQ channel is not created.");
        }
        const exchangeName = Configs_1.QNExchange;
        const logDetails = {
            logType: Configs_1.QNRoutingKey,
            message: message,
            dateTime: new Date(),
        };
        this.channel.publish(exchangeName, Configs_1.QNRoutingKey, Buffer.from(JSON.stringify(logDetails)), { persistent: true });
        console.log(`The new ${Configs_1.QNRoutingKey} log is sent to exchange ${exchangeName}`);
    }
}
exports.default = Producer;
//# sourceMappingURL=Producer.js.map