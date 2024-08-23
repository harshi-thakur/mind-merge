import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

const sendEmail = async (to:string, subject:string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to:to,
    subject:subject,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
export default sendEmail;