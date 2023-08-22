import * as amqp from "amqplib";
import {
  QNExchange,
  QNRoutingKey,
  QNotification,
} from "../../../Utilities/Configs";
import { IEmailRequest } from "Models/IEmail";
import { SendEmailMessage } from "../SendEmail/NodeMailer";
import { htmlContent } from "../SendEmail/HtmlGenerator";

class Consumer {
  private connection: amqp.Connection;
  private channel: amqp.Channel | null;

  constructor(connection: amqp.Connection) {
    this.connection = connection;
    this.channel = null;

    this.createChannel();
  }

  createChannel(): void {
    if (!this.connection) {
      throw new Error("RabbitMQ connection is not established.");
    }

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
    if (!this.channel) {
      throw new Error("RabbitMQ channel is not created.");
    }

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
    if (!this.channel) {
      throw new Error("RabbitMQ channel is not created.");
    }

    const queueName: string = QNotification;

    this.channel.consume(queueName, async (msg: amqp.ConsumeMessage | null) => {
      if (msg !== null) {
        const logDetails = JSON.parse(msg.content.toString());
        const payload: IEmailRequest = JSON.parse(logDetails.message);
        console.log("Consumer Received message:", logDetails);
        // console.log("Consumer Payload: ", payload);
        if (payload.Type === "Email verification") {
          await SendEmailMessage(
            payload.Reciever,
            payload.Name,
            payload.Type,
            "You are welcome to Quickee App",
            htmlContent(payload.Name, payload.Code)
          );
        }
        // Process the message as needed

        this.channel.ack(msg);
      }
    });
  }
}

export default Consumer;
