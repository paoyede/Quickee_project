"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Configs_1 = require("../../../Utilities/Configs");
class Consumer {
    connection;
    channel;
    constructor() {
        // const rabbitmqConnection = RabbitMQConfig.getInstance();
        this.connection = null;
        this.channel = null;
        // rabbitmqConnection
        //   .createRabbitMQConnection()
        //   .then((connection) => {
        //     this.connection = connection;
        //     this.createChannel();
        //   })
        //   .catch((error) => {
        //     console.error("Error creating RabbitMQ connection", error);
        //   });
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
            this.consumeMessages();
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
    consumeMessages() {
        if (!this.channel) {
            throw new Error("RabbitMQ channel is not created.");
        }
        const queueName = Configs_1.QNotification;
        this.channel.consume(queueName, (msg) => {
            if (msg !== null) {
                const logDetails = JSON.parse(msg.content.toString());
                console.log("Received message:", logDetails);
                // Process the message as needed
                this.channel.ack(msg);
            }
        });
    }
}
exports.default = Consumer;
//# sourceMappingURL=Consumer.js.map