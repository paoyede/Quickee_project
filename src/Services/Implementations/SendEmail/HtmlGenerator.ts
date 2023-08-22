export const htmlContent = (surname: string, verificationCode: string) => `
  <div style="text-align: center;">
    <b>Hello ${surname},</b><br>
    Thank you for registering with us.<br>
    Your email verification code is: ${verificationCode}
  </div>
`;
