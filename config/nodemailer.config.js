import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();



const transporter = nodemailer.createTransport({
  service: 'gmail',

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password
  },
});
export const sendEmail = async (to, subject, html) => {

 
 
  const mailOptions = {
    from: `"FixlCRM" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  
  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info("Email sent successfully!");
    return info;
  } catch (error) {
    logger.error("Error sending email:", error.message);
    throw error;
  }
};

export const sendCustomEmail = async ({
  from,
  to,
  cc,
  bcc,
  subject,
  html,
  text,
}) => {
  const mailOptions = {
    from: from || `"FixlCRM" <${process.env.EMAIL_USER}>`, // default if not passed
    to,
    cc,
    bcc,
    subject,
    text, // optional plain text
    html,
  
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info("Custom email sent successfully!");
    return info;
  } catch (error) {
    logger.error("Error sending custom email:", error.message);
    throw error;
  }
};


export default transporter;
