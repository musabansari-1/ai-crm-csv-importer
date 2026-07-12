import multer from "multer";
import { ApiError } from "../../utils/ApiError.js";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  const isCsv =
    file.mimetype === "text/csv" ||
    file.originalname.toLowerCase().endsWith(".csv");

  if (!isCsv) {
    return callback(new ApiError(400, "Only CSV files are allowed."));
  }

  callback(null, true);
};

export const upload = multer({
  storage,
  limits: {
    // Match frontend csvValidator max (10 MB)
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});