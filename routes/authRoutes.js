import express from "express";
import { logout, sendOtpHandler, verifyOtpHandler } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send-otp", sendOtpHandler);
router.post("/verify-otp", verifyOtpHandler);
router.post("/logout", logout);

router.get("/me", protect, (req, res) => {
  res.status(200).json({ email: req.admin.email });
});

export default router;
