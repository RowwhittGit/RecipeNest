// src/services/recipe.service.ts
import { Recipe } from '../models/Recipe.model';

export const getAllRecipes = async () => {
  return await Recipe.find().sort({ createdAt: -1 });
};

export const createRecipe = async (data: {
  title:        string;
  description:  string;
  ingredients:  string[];
  instructions: string;
  category:     string;
}) => {
  const recipe = new Recipe(data);
  return await recipe.save();
};