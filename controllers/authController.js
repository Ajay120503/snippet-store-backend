import Admin from "../models/Admin.js";
import { sendOTP } from "../config/mailer.js";
import { generateOTP } from "../utils/otpGenerator.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const sendOtpHandler = async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  let admin = await Admin.findOne({ email });
  if (!admin) admin = await Admin.create({ email });
  admin.otp = hashedOtp;
  admin.otpExpires = expires;
  await admin.save();
  await sendOTP(email, otp);
  res.status(200).json({ message: "OTP sent to email" });
};

export const verifyOtpHandler = async (req, res) => {
  const { email, otp } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !admin.otp || admin.otpExpires < new Date()) {
    return res.status(400).json({ message: "OTP expired or invalid" });
  }
  const isValid = await bcrypt.compare(otp, admin.otp);
  if (!isValid) return res.status(401).json({ message: "Invalid OTP" });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  admin.otp = null;
  admin.otpExpires = null;
  await admin.save();
  res.status(200).json({ token });
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(200).json({ message: "Logged out successfully" });
};