import * as amqp from "amqplib";
import {
  Host,
  Password,
  Port,
  Username,
  Virtual,
} from "../../../Utilities/Configs";

class RabbitMQConfig {
  connection: amqp.Connection | null;

  constructor() {
    this.connection = null;
  }

  async initialize(): Promise<void> {
    try {
      this.connection = await this.createRabbitMQConnection();
      console.log("RabbitMQ connection established");
    } catch (error) {
      console.error("Error initializing RabbitMQ connection", error);
    }
  }

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

      // console.log("Connected to RabbitMQ");
      return connection;
    } catch (error) {
      console.error("Error connecting to RabbitMQ", error);
      throw error;
    }
  }
}

export default RabbitMQConfig;
