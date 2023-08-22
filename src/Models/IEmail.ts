export interface IEmailRequest {
  Type: string;
  Payload?: Map<string, any>;
  Reciever: string;
  Code: string;
  Name: string;
}
