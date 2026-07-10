import { ApiError } from "../../utils/ApiError.js";

export const importCsv = async (file?: Express.Multer.File) => {
  if (!file) {
    throw new ApiError(400, "CSV file is required.");
  }

  if (file.size === 0) {
    throw new ApiError(400, "Uploaded CSV file is empty.");
  }

  return {
    fileName: file.originalname,
    fileSize: file.size,
    message: "CSV uploaded successfully.",
  };
};