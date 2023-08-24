export interface IEmailRequest {
  EmailTemplate: string;
  Type: string;
  Payload?: any; // it is a Map<string, any>
  Reciever: string;
  Name: string;
}
