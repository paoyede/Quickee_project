import {
  Host,
  Password,
  Port,
  Username,
  Virtual,
} from "../../../Utilities/Configs";

import * as amqp from "amqplib";

class RabbitMQConfig {
  async createRabbitMQConnection(): Promise<amqp.Connection> {
    try {
      console.log("Connecting to RabbitMQ");
      const connection = await amqp.connect({
        hostname: Host,
        username: Username,
        password: Password,
        port: Port,
        vhost: Virtual,
      });

      console.log("Connected to RabbitMQ");
      return connection;
    } catch (error) {
      console.error("Error connecting to RabbitMQ", error);
      throw error; // rethrow the error to handle it outside the class if needed
    }
  }
}

export default RabbitMQConfig;
