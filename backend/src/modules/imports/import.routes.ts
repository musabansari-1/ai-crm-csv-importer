import { Router } from "express";
import { upload } from "./upload.middleware.js";
import * as importController from "./import.controller.js";

const router = Router();

router.post("/", upload.single("file"), importController.importCsv);
router.post(
  "/stream",
  upload.single("file"),
  importController.importCsvStream,
);

export default router;
