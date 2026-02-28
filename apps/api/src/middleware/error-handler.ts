import { Request, Response, NextFunction } from "express";
import { ErrorCode, toBlerpError } from "../lib/errors";
import { logger } from "../lib/logger";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const blerpError = toBlerpError(err);

  if (blerpError.code === ErrorCode.INTERNAL_ERROR) {
    logger.error({ err, path: req.path, method: req.method }, "Internal server error");
  } else {
    logger.warn({ code: blerpError.code, path: req.path, method: req.method }, blerpError.message);
  }

  res.status(blerpError.statusCode).json(blerpError.toJSON());
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
