// src/routes/recipe.routes.ts
import { Router } from 'express';
import { getAllRecipes, createRecipe } from '../controllers/recipe.controller';
import { validate, createRecipeSchema } from '../validations/recipe.validation';

const router = Router();

router.get('/',  getAllRecipes);
router.post('/', validate(createRecipeSchema), createRecipe);

export default router;