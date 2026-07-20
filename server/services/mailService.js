const nodemailer = require('nodemailer');

const createMailTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    const error = new Error('SMTP is not fully configured in server/.env file.');
    error.statusCode = 400;
    throw error;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const sendMail = async (mailOptions) => {
  const transporter = createMailTransporter();
  return await transporter.sendMail(mailOptions);
};

module.exports = {
  createMailTransporter,
  sendMail
};
