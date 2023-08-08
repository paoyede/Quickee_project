import * as amqp from "amqplib";
import RabbitMQConfig from "./Connection";
import {
  QNExchange,
  QNRoutingKey,
  QNotification,
} from "../../../Utilities/Configs";

const rabbitConnection = new RabbitMQConfig();

class Consumer {
  connection: amqp.Connection | null;
  channel: amqp.Channel | null;

  constructor() {
    this.connection = null;
    this.channel = null;
    rabbitConnection
      .createRabbitMQConnection()
      .then((connection: amqp.Connection) => {
        this.connection = connection;
        this.createChannel();
      })
      .catch((error: Error) => {
        console.error("Error creating RabbitMQ connection", error);
      });
  }

  createChannel(): void {
    this.connection
      .createChannel()
      .then((channel: amqp.Channel) => {
        this.channel = channel;
        this.configureChannel();
        this.consumeMessages();
      })
      .catch((error: Error) => {
        console.error("Error creating channel", error);
      });
  }

  configureChannel(): void {
    const exchangeName: string = QNExchange;
    this.channel
      .assertExchange(exchangeName, "topic")
      .then(() => {
        return this.channel.assertQueue(QNotification, {
          durable: false,
          exclusive: false,
          autoDelete: false,
        });
      })
      .then(() => {
        return this.channel.bindQueue(
          QNotification,
          exchangeName,
          QNRoutingKey
        );
      })
      .then(() => {
        this.channel.prefetch(1);
      })
      .catch((error: Error) => {
        console.error("Error configuring channel", error);
      });
  }

  consumeMessages(): void {
    const queueName: string = QNotification;

    this.channel.consume(queueName, (msg: amqp.ConsumeMessage | null) => {
      if (msg !== null) {
        const logDetails = JSON.parse(msg.content.toString());
        console.log("Received message:", logDetails);

        // Process the message as needed

        this.channel.ack(msg);
      }
    });
  }
}

export default Consumer;
