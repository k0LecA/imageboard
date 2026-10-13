import express from "express";
import { getFile } from "../controllers/files.js";

const router = express.Router();

router.get("/:fileId", getFile);

export default router;
