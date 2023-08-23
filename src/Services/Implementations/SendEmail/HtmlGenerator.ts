export const htmlContent = (surname: string, verificationCode: string) => `
  <div
      style="
        margin: 0 auto;
        padding: 20px;
         background-color: #55caca;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
        text-align: left;
      "
    >
      <div
        style="
          width: 60%;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
          text-align: left;
        "
      >
        <img
          class="logo"
          src="https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg"
          alt="Company Logo"
          style="
            max-width: 100px;
            height: auto;
            margin-left: 42%;
            margin-top: 10px;
            margin-bottom: 20px;
          "
        />
        <p style="color: #666666">Dear ${surname},</p>
        <p style="color: #666666">
          We are thrilled to have you become one of our customer. 🎉 Your
          presence helps us to know how we can provide healthy food to the
          society, and we can't wait to get to know you better.
          <b> The code below expires in 5 minutes, </b> please use this code to
          verify your email address:
        </p>
        <a
          style="
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            letter-spacing: 8px;
            margin-left: 40%;
          "
          href="#"
          >${verificationCode}</a
        >
        <p style="color: #666666">
          If you didn't sign up for this service, you can safely ignore this
          email.
        </p>
        <p style="color: #666666">Best regards,<br />Quickee Support</p>
      </div>
    </div>
`;
