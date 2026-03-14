// src/validations/recipe.validation.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const createRecipeSchema = z.object({
  title:        z.string().min(3, 'Title must be at least 3 characters'),
  description:  z.string().min(10, 'Description too short'),
  ingredients:  z.array(z.string()).min(1, 'Add at least one ingredient'),
  instructions: z.string().min(10, 'Instructions too short'),
  category:     z.string().min(1, 'Category is required'),
});

// Reusable validate middleware — works with any zod schema
export const validate = (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data; // replace with clean typed data
    next();
  };