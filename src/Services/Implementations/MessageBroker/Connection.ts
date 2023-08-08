import * as amqp from "amqplib";
import {
  Host,
  Password,
  Port,
  Username,
  Virtual,
} from "../../../Utilities/Configs";

class RabbitMQConfig {
  private static instance: RabbitMQConfig | null = null;
  connection: amqp.Connection | null;

  private constructor() {
    this.connection = null;
  }

  static getInstance(): RabbitMQConfig {
    if (!RabbitMQConfig.instance) {
      RabbitMQConfig.instance = new RabbitMQConfig();
    }
    return RabbitMQConfig.instance;
  }

  async createRabbitMQConnection(): Promise<amqp.Connection> {
    try {
      // if (!this.connection) {
      console.log("Connecting to RabbitMQ");
      this.connection = await amqp.connect({
        hostname: Host,
        username: Username,
        password: Password,
        port: Port,
        vhost: Virtual,
      });

      console.log("Connected to RabbitMQ");
      return this.connection;
    } catch (error) {
      console.error("Error connecting to RabbitMQ", error);
      throw error; // rethrow the error to handle it outside the class if needed
    }
  }
}

export default RabbitMQConfig;
