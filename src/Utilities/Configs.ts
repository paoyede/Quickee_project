import dotenv from "dotenv";

dotenv.config();

export const jwtaccesssecret: string | undefined =
  process.env.JWT_ACCESS_TOKEN_SECRET;
export const jwtrefreshsecret: string | undefined =
  process.env.JWT_REFRESH_TOKEN_SECRET;

export const etherealHost = process.env.ETHEREAL_HOST;

export const gmailEmail = process.env.GMAIL_EMAIL;
export const gmailPassword = process.env.GMAIL_PASSWORD;
export const gmailHost = process.env.GMAIL_HOST;
export const gmailPort = parseInt(process.env.GMAIL_PORT, 10);

export const orgEmail = process.env.ORG_EMAIL;
export const orgPassword = process.env.ORG_PASSWORD;
export const orgHost = process.env.ORG_HOST;
export const orgPort = parseInt(process.env.ORG_PORT, 10);

export const TwilioAcctSid = process.env.TWILIO_ACCOUNT_SID;
export const TwilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
export const TwilioFrom = process.env.TWILIO_FROM;
export const paystacksecret = process.env.PAYSTACK_SECRET_KEY;
export const flutterwavePKey = process.env.FLUTTERWAVE_PUBLIC_KEY;
export const flutterwaveSKey = process.env.FLUTTERWAVE_SECRET_KEY;
export const flutterwaveEKey = process.env.FLUTTERWAVE_ENCRYPT_KEY;

//RabbitMQ
export const AppId = process.env.APP_ID;
export const Host = process.env.RABBITMQ_HOST;
export const Username = process.env.RABBITMQ_USERNAME;
export const Password = process.env.RABBITMQ_PASSWORD;
export const Port = parseInt(process.env.RABBITMQ_PORT, 10);
export const Virtual = process.env.RABBITMQ_VIRTUAL;
export const User = process.env.QUEUE_USER;
export const QNotification = process.env.QUEUE_NOTIFICATION;
export const QNExchange = process.env.QUEUE_NOTIFICATION_EXCHANGE;
export const QNRoutingKey = process.env.QUEUE_NOTIFICATION_ROUTING_KEY;
export const QIdentity = process.env.QUEUE_IDENTITY;
export const QIRoutingKey = process.env.QUEUE_IDENTITY_ROUTING_KEY;
export const QIExchange = process.env.QUEUE_IDENTITY_EXCHANGE;
