import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';



interface SendMailOptions {
  email: string;
  subject: string;
  message: string;
}

export  async function sendMail(options: SendMailOptions) {
    
if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT ||!process.env.EMAIL_PASSWORD || !process.env.EMAIL_USER ) {
  throw new Error('Missing environment variables for SMTP Connection');
}
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt( process.env.EMAIL_PORT, 10),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  } as SMTPTransport.Options);
    
    
  const mailOptions = {
    from: 'tomisin-wilson <tommywilson972@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
}
