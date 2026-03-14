// src/controllers/recipe.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import * as recipeService from '../services/recipe.service';

// GET /api/recipes
export const getAllRecipes = asyncHandler(async (req: Request, res: Response) => {
  const recipes = await recipeService.getAllRecipes();
  res.status(200).json(ApiResponse(recipes, 'Recipes fetched successfully'));
});

// POST /api/recipes
export const createRecipe = asyncHandler(async (req: Request, res: Response) => {
  const recipe = await recipeService.createRecipe(req.body);
  res.status(201).json(ApiResponse(recipe, 'Recipe created successfully'));
});