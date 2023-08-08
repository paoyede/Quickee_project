import { mail } from "./MailGen";
import nodemailer, { TransportOptions } from "nodemailer";
import MailerConfig from "./TransportParam";

const mailerConfig = new MailerConfig();

export const SendEmailMessage = async (
  to: string,
  subject: string,
  message: string
): Promise<any> => {
  let param: any;
  // param = await mailerConfig.getEtherealTestParam();
  param = mailerConfig.gmailParam;
  // param = mailerConfig.mainParam;

  let transporter = nodemailer.createTransport(param);

  let mailOptions = {
    from: `Quickee <${param.auth.user}>`,
    to: `Nifemi ${to}`,
    subject: subject,
    text: message,
    html: mail,
  };

  return transporter
    .sendMail(mailOptions)
    .then((info) => {
      // console.log({ preview: nodemailer.getTestMessageUrl(info) });
      return info;
    })
    .catch((err) => {
      throw err;
    });
};
