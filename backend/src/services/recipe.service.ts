import { Recipe } from '../models/Recipe.model';

// ── Types ────────────────────────────────────────────────────
export interface PaginationOptions {
  page:  number;
  limit: number;
}

export interface PaginatedResult<T> {
  data:        T[];
  total:       number;
  page:        number;
  limit:       number;
  totalPages:  number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ── Get all with pagination ───────────────────────────────────
export const getAllRecipes = async (
  options: PaginationOptions
): Promise<PaginatedResult<any>> => {
  const { page, limit } = options;
  const skip = (page - 1) * limit; // page 1 → skip 0, page 2 → skip 10

  // Run both queries in parallel — total count + current page data
  const [recipes, total] = await Promise.all([
    Recipe.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Recipe.countDocuments(),
  ]);

  return {
    data:        recipes,
    total,
    page,
    limit,
    totalPages:  Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };
};

// ── Create ───────────────────────────────────────────────────
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