const USDA_URL = "https://api.nal.usda.gov/fdc/v1";

// USDA nutrient IDs
const nutrientIds = {
  calories: [2048, 2047, 1008],
  protein: [1003],
  carbohydrates: [1005],
  fat: [1004],
  fiber: [1079],
  sugar: [2000, 1063],
};

// Ingredient-specific search terms and matching rules.
// These help avoid selecting processed foods or complete meals.
const ingredientProfiles = [
  {
    matches: ["chicken breast"],
    query: "chicken breast boneless skinless raw",
    preferred: ["chicken, breast, boneless, skinless, raw"],
    excluded: [
      "lunchmeat",
      "deli",
      "breaded",
      "tenders",
      "roll, oven-roasted",
      "honey glazed",
      "fat-free",
      "mesquite",
      "cooked",
      "fried",
    ],
  },
  {
    matches: ["hamburger bun", "burger bun", "hamburger roll"],
    query: "rolls hamburger or hotdog plain",
    preferred: ["rolls, hamburger or hotdog, plain"],
    excluded: [
      "fast foods",
      "mcdonald",
      "burger king",
      "wendy",
      "patty",
      "condiments",
      "special sauce",
      "cheese",
      "mixed-grain",
      "cinnamon",
    ],
  },
  {
    matches: ["cheddar cheese"],
    query: "cheese cheddar",
    preferred: ["cheese, cheddar"],
    excluded: ["sauce", "spread", "processed cheese food"],
  },
  {
    matches: ["lettuce"],
    query: "lettuce raw",
    preferred: ["lettuce, green leaf, raw", "lettuce, iceberg, raw"],
    excluded: ["dressing", "salad with dressing"],
  },
  {
    matches: ["tomato"],
    query: "tomatoes red ripe raw",
    preferred: ["tomatoes, red, ripe, raw"],
    excluded: ["sauce", "paste", "ketchup", "canned"],
  },
  {
    matches: ["mayonnaise", "mayo"],
    query: "mayonnaise regular",
    preferred: ["salad dressing, mayonnaise"],
    excluded: ["low calorie", "reduced fat", "light", "sandwich spread"],
  },
];

const tokenize = (name = "") => name.toLowerCase().match(/[a-z0-9]+/g) || [];

const normalize = (name = "") =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getIngredientProfile = (ingredientName) => {
  const name = normalize(ingredientName);

  return ingredientProfiles.find((profile) =>
    profile.matches.some((item) => name.includes(normalize(item))),
  );
};

// Get nutrient ID from either USDA search or detailed food response.
const getNutrientId = (item) =>
  Number(item.nutrientId ?? item.nutrient?.id ?? item.id);

const getNutrientValue = (item) => {
  const value = item.value ?? item.amount;

  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return null;
  }

  return Number(value);
};

const findNutrient = (nutrients, ids) => {
  for (const id of ids) {
    const item = nutrients.find((nutrient) => getNutrientId(nutrient) === id);

    const value = item ? getNutrientValue(item) : null;

    if (value !== null) {
      return value;
    }
  }

  return null;
};

// Score USDA search results.
const findBestMatch = (foods, ingredientName) => {
  const profile = getIngredientProfile(ingredientName);
  const queryWords = tokenize(profile?.query || ingredientName);

  let bestMatch = null;
  let bestScore = -Infinity;

  for (const food of foods) {
    const description = normalize(food.description || "");
    let score = 0;

    // Strongly prefer known correct food descriptions.
    if (profile) {
      for (const preferred of profile.preferred) {
        if (description === normalize(preferred)) {
          score += 100;
        } else if (description.includes(normalize(preferred))) {
          score += 60;
        }
      }

      // Reject misleading matches.
      const excluded = profile.excluded || [];

      if (excluded.some((term) => description.includes(normalize(term)))) {
        score -= 100;
      }
    }

    // Score matching words.
    const descriptionWords = tokenize(description);

    for (const word of queryWords) {
      if (descriptionWords.includes(word)) {
        score += 2;
      }
    }

    // Prefer Foundation and SR Legacy records.
    if (food.dataType === "Foundation") score += 5;
    if (food.dataType === "SR Legacy") score += 4;

    // Avoid complete prepared meals.
    if (
      description.includes("fast foods") ||
      description.includes("restaurant") ||
      description.includes("with condiments")
    ) {
      score -= 30;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = food;
    }
  }

  // Do not accept a weak or rejected match.
  if (!bestMatch || bestScore <= 0) {
    return null;
  }

  return bestMatch;
};

// Search USDA for one ingredient and fetch its detailed record.
const searchUSDA = async (ingredientName) => {
  const apiKey = process.env.USDA_API_KEY;

  if (!apiKey) {
    throw new Error("USDA API key is missing.");
  }

  const profile = getIngredientProfile(ingredientName);
  const searchQuery = profile?.query || ingredientName;

  const response = await fetch(
    `${USDA_URL}/foods/search?api_key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        dataType: ["Foundation", "SR Legacy"],
        pageSize: 50,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`USDA search error: ${response.status}`);
  }

  const data = await response.json();
  const foods = data.foods || [];

  const matchedFood = findBestMatch(foods, ingredientName);

  console.log("\n------------------------------");
  console.log("Ingredient:", ingredientName);
  console.log("USDA search query:", searchQuery);
  console.log(
    "Selected USDA match:",
    matchedFood?.description || "No suitable match",
  );
  console.log("------------------------------");

  if (!matchedFood) {
    return null;
  }

  // Fetch the complete USDA food record.
  const detailResponse = await fetch(
    `${USDA_URL}/food/${matchedFood.fdcId}?api_key=${encodeURIComponent(apiKey)}`,
  );

  if (!detailResponse.ok) {
    throw new Error(`USDA food detail error: ${detailResponse.status}`);
  }

  const detailedFood = await detailResponse.json();
  const nutrients = detailedFood.foodNutrients || [];

  const nutritionPer100g = {
    calories: findNutrient(nutrients, nutrientIds.calories),
    protein: findNutrient(nutrients, nutrientIds.protein),
    carbohydrates: findNutrient(nutrients, nutrientIds.carbohydrates),
    fat: findNutrient(nutrients, nutrientIds.fat),
    fiber: findNutrient(nutrients, nutrientIds.fiber),
    sugar: findNutrient(nutrients, nutrientIds.sugar),
  };

  console.log("Detailed USDA record:", detailedFood.description);
  console.log("Nutrition per 100g:", nutritionPer100g);

  return {
    sourceId: detailedFood.fdcId,
    matchedFoodName: detailedFood.description,
    nutritionPer100g,
  };
};

// Calculate nutrition based on ingredient weight in grams.
const calculateIngredientNutrition = (nutritionPer100g, weight) => {
  const result = {};

  for (const key of Object.keys(nutrientIds)) {
    const value = nutritionPer100g[key];

    result[key] =
      value === null ? null : Number(((value * weight) / 100).toFixed(2));
  }

  return result;
};

// Add the nutrition of all ingredients.
const calculateTotalNutrition = (ingredients) => {
  const totals = {};

  for (const key of Object.keys(nutrientIds)) {
    const hasMissingValue = ingredients.some(
      (item) => item.nutrition[key] === null,
    );

    totals[key] = hasMissingValue
      ? null
      : Number(
          ingredients
            .reduce((sum, item) => sum + item.nutrition[key], 0)
            .toFixed(2),
        );
  }

  return totals;
};

// Generate basic nutrition insights.
const generateNutritionInsights = (nutrition) => {
  const insights = [];

  if (nutrition.protein !== null) {
    if (nutrition.protein >= 15) {
      insights.push("This serving provides a notable amount of protein.");
    } else {
      insights.push("This serving has a relatively lower protein amount.");
    }
  }

  if (nutrition.fiber !== null && nutrition.fiber >= 5) {
    insights.push("This serving provides dietary fibre.");
  }

  if (nutrition.sugar !== null && nutrition.sugar >= 15) {
    insights.push("This serving contains a notable amount of sugar.");
  }

  if (nutrition.fat !== null && nutrition.fat >= 20) {
    insights.push("This serving contains a notable amount of fat.");
  }

  return insights;
};

// Return unavailable nutrition response.
const unavailableNutrition = (
  sourceName,
  estimateNote,
  ingredients = [],
  healthInsights = [],
) => ({
  source: "unavailable",
  sourceName,
  sourceId: null,
  basis: "unknown",
  servingSize: "Not available",
  nutrition: null,
  ingredients,
  healthInsights,
  possibleAllergens: [],
  estimateNote,
});

// Main nutrition calculator.
const generateNutrition = async (food) => {
  if (!food.ingredients || food.ingredients.length === 0) {
    return unavailableNutrition(
      "No ingredients available",
      "The admin has not added ingredients for this food item.",
    );
  }

  const calculatedIngredients = [];

  for (const ingredient of food.ingredients) {
    const weight = Number(ingredient.quantity);

    if (ingredient.unit !== "g" || !Number.isFinite(weight) || weight <= 0) {
      return unavailableNutrition(
        "Invalid ingredient weight",
        "All ingredient quantities must be entered in grams.",
        calculatedIngredients,
      );
    }

    let databaseResult;

    try {
      databaseResult = await searchUSDA(ingredient.name);
    } catch (error) {
      console.error(`USDA error for ${ingredient.name}:`, error.message);

      return unavailableNutrition(
        "USDA service error",
        `Unable to retrieve USDA data for ${ingredient.name}. Please try again later.`,
        calculatedIngredients,
      );
    }

    if (!databaseResult) {
      return unavailableNutrition(
        "USDA match not found",
        `A suitable USDA food record was not found for ${ingredient.name}. Please review the ingredient mapping.`,
        calculatedIngredients,
      );
    }

    const ingredientNutrition = calculateIngredientNutrition(
      databaseResult.nutritionPer100g,
      weight,
    );

    // Calories, protein, carbohydrates and fat are required.
    const requiredNutrients = ["calories", "protein", "carbohydrates", "fat"];

    const missingNutrients = requiredNutrients.filter(
      (key) => ingredientNutrition[key] === null,
    );

    if (missingNutrients.length > 0) {
      return unavailableNutrition(
        "Incomplete USDA data",
        `Missing ${missingNutrients.join(", ")} data for ${ingredient.name}. Please review its USDA food record.`,
        calculatedIngredients,
      );
    }

    calculatedIngredients.push({
      name: ingredient.name,
      weight,
      unit: "g",
      matchedFoodName: databaseResult.matchedFoodName,
      sourceId: databaseResult.sourceId,
      nutrition: ingredientNutrition,
    });
  }

  const totalNutrition = calculateTotalNutrition(calculatedIngredients);

  const totalWeight = calculatedIngredients.reduce(
    (sum, item) => sum + item.weight,
    0,
  );

  return {
    source: "calculated",
    sourceName: "USDA FoodData Central",
    sourceId: null,
    basis: "per complete serving",
    servingSize: `1 serving (${totalWeight} g)`,
    nutrition: totalNutrition,
    ingredients: calculatedIngredients,
    healthInsights: generateNutritionInsights(totalNutrition),
    possibleAllergens: [],
    estimateNote:
      "Nutrition is estimated by adding USDA ingredient values according to the entered weights. Actual values may differ due to cooking, preparation, oil absorption and ingredient variations. USDA food matches should be reviewed.",
  };
};

export { generateNutrition };
