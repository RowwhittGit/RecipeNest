// src/routes/index.ts
import { Router } from 'express';
import recipeRoutes from './recipe.routes';
import authRouter from './auth.routes';

const router = Router();

router.use('/api', recipeRoutes);
router.use('/auth', authRouter)

export default router;