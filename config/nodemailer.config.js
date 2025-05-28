import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const HOST = process.env.SMTP_HOST;
const PORT = process.env.SMTP_PORT;
const USER = process.env.SMTP_USER||"manishfixl@gmail.com"
const PASS = process.env.SMTP_PASS || 'lxcmhflevqxgjwtnoj'



const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true, // true for 465, false for other ports
  auth: {
    user: USER,
    pass: PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default transporter;
