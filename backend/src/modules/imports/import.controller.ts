import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import  {importService} from "./import.service.js";

export const importCsv = asyncHandler(async (req: Request, res: Response) => {
  const result = await importService.importCsv(req.file);

  res.status(200).json({
    success: true,
    data: result,
  });
});