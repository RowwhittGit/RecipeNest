import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { invalidateCache } from '../middleware/cache';
import * as recipeService from '../services/recipe.service';

// GET /api/recipes?page=1&limit=10
export const getAllRecipes = asyncHandler(async (req: Request, res: Response) => {
  // Read from query string, fall back to sensible defaults
  const page  = Math.max(1, Number(req.query.page)  || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);
  // Math.max(1, ...) prevents page 0 or negative pages
  // Math.min(50, ...) prevents someone requesting limit=10000

  const result = await recipeService.getAllRecipes({ page, limit });
  res.status(200).json(ApiResponse(result, 'Recipes fetched successfully'));
});

// POST /api/recipes
export const createRecipe = asyncHandler(async (req: Request, res: Response) => {
  const recipe = await recipeService.createRecipe(req.body);

  // Wipe all cached recipe pages so the next GET sees fresh data
  await invalidateCache('cache:/api/recipes*');

  res.status(201).json(ApiResponse(recipe, 'Recipe created successfully'));
});