import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS
)
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
    console.log("Email sent successfully!");
    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};


export default transporter;
