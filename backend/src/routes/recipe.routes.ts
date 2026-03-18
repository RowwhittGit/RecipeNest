// src/routes/recipe.routes.ts
import { Router } from 'express';
import { getAllRecipes, createRecipe } from '../controllers/recipe.controller';
import { validate, createRecipeSchema } from '../validations/recipe.validation';
import { cache } from '../middleware/cache';


const recipeRoutes = Router();

recipeRoutes.get('/recipe', cache(300)  , getAllRecipes);
recipeRoutes.post('/recipe', validate(createRecipeSchema), createRecipe);

export default recipeRoutes;