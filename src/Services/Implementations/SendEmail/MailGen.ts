import Mailgen from "mailgen";

interface MailGeneratorOptions {
  theme?: "default" | "salted" | "cerberus";
  product: {
    name: string;
    link: string;
  };
}

const MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "ArchIntel",
    link: "https://archdemy.netlify.app/",
  },
});

const response = {
  body: {
    name: "Raphael",
    intro: "Your bill has arrived",
    table: {
      data: [
        {
          item: "Nodemailer Stack Book",
          description: "A Backend app",
          price: "$10.99",
        },
      ],
    },
    outro: "See you again",
  },
};

export const mail: string = MailGenerator.generate(response);
