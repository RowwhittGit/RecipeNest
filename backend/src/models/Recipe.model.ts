// src/models/Recipe.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IRecipe extends Document {
  title:        string;
  description:  string;
  ingredients:  string[];
  instructions: string;
  category:     string;
  createdAt:    Date;
  updatedAt:    Date;
}

const recipeSchema = new Schema<IRecipe>(
  {
    title:        { type: String, required: true, trim: true },
    description:  { type: String, required: true },
    ingredients:  { type: [String], required: true },
    instructions: { type: String, required: true },
    category:     { type: String, required: true },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

export const Recipe = mongoose.model<IRecipe>('Recipe', recipeSchema);