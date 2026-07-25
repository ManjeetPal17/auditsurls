import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const auditSchema = z.object({
  url: z.string({
    required_error: 'URL is required'
  })
  .trim()
  .url({ message: 'Invalid URL format. Make sure to include http:// or https://' })
});

export const validateAuditRequest = (req: Request, res: Response, next: NextFunction) => {
  const result = auditSchema.safeParse(req.body);
  if (!result.success) {
    const errorMessages = result.error.errors.map(err => err.message).join('. ');
    return res.status(400).json({
      success: false,
      error: errorMessages
    });
  }
  next();
};
