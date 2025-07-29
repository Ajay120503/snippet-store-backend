import express from "express";
import {
  getAllSnippets,
  createSnippet,
  updateSnippet,
  deleteSnippet,
} from "../controllers/snippetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllSnippets);
router.post("/", protect, createSnippet);
router.put("/:id", protect, updateSnippet);
router.delete("/:id", protect, deleteSnippet);

export default router;