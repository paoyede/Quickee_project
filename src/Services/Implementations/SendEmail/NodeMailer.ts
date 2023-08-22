import { mail } from "./MailGen";
import nodemailer, { TransportOptions } from "nodemailer";
import MailerConfig from "./TransportParam";

const mailerConfig = new MailerConfig();

export const SendEmailMessage = async (
  to: string,
  name: string,
  subject: string,
  message: string,
  htmlBody: string
): Promise<any> => {
  let param: any;
  // param = await mailerConfig.getEtherealTestParam();
  param = mailerConfig.gmailParam;
  // param = mailerConfig.mainParam;
  // console.log("sender: ", { ...param });

  let transporter = nodemailer.createTransport(param);

  let mailOptions = {
    from: `Quickee <${param.auth.user}>`,
    to: `${name} ${to}`,
    subject: subject,
    text: message,
    html: htmlBody,
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
