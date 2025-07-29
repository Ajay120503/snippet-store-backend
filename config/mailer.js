import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

console.log("📧 Mailer Config →", {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? '✅ EXISTS' : '❌ MISSING',
});

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"Snippet Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for Snippet Store Admin Login",
    html: `<p>Your OTP is: <b>${otp}</b>. It expires in 5 minutes.</p>`,
  };
  await transporter.sendMail(mailOptions);
};
