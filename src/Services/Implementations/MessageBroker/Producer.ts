import * as amqp from "amqplib";
import RabbitMQConfig from "./Connection";
import {
  QNExchange,
  QNRoutingKey,
  QNotification,
} from "../../../Utilities/Configs";

const rabbitConnection = new RabbitMQConfig();

class Producer {
  private connection: amqp.Connection | null;
  private channel: amqp.Channel | null;

  constructor() {
    this.connection = null;
    this.channel = null;
    rabbitConnection
      .createRabbitMQConnection()
      .then((connection) => {
        this.connection = connection;
        this.createChannel();
      })
      .catch((error) => {
        console.error("Error creating RabbitMQ connection", error);
      });
  }

  private createChannel() {
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

  private configureChannel() {
    if (!this.channel) {
      throw new Error("RabbitMQ channel is not created.");
    }

    const exchangeName = QNExchange;
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
      .catch((error) => {
        console.error("Error configuring channel", error);
      });
  }

  public publishMessage(message: string) {
    if (!this.channel) {
      throw new Error("RabbitMQ channel is not created.");
    }

    const exchangeName = QNExchange;
    const logDetails = {
      logType: QNRoutingKey,
      message: message,
      dateTime: new Date(),
    };

    this.channel.publish(
      exchangeName,
      QNRoutingKey,
      Buffer.from(JSON.stringify(logDetails)),
      { persistent: true } as amqp.Options.Publish
    );
    console.log(
      `The new ${QNRoutingKey} log is sent to exchange ${exchangeName}`
    );
  }
}

export default Producer;
