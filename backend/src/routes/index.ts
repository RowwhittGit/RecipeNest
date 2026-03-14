// src/routes/index.ts
import { Router } from 'express';
import recipeRoutes from './recipe.routes';

const router = Router();

router.use('/recipes', recipeRoutes);

export default router;