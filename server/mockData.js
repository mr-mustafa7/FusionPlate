// Offline-safe canned responses so the demo never dies on a flaky connection,
// missing API key, or rate limit mid-judging (see demo reliability checklist).

export const MOCK_FUSIONS = [
  {
    extraction: {
      fridgeIngredients: ["eggs", "leftover rice", "kimchi", "cheddar cheese", "spring onion"],
      cravingDish: "carbonara",
      cravingCuisine: "Italian",
      cravingFlavorNotes: ["creamy", "savory", "peppery", "rich"]
    },
    recipe: {
      title: "Kimchi Carbonara Fried Rice",
      tagline: "Rome meets Seoul in one very confused, very delicious pan.",
      fusedCuisines: ["Italian", "Korean"],
      fusionScore: { fridgePercent: 65, cravingPercent: 35 },
      ingredients: [
        { item: "leftover rice", have: true },
        { item: "eggs", have: true },
        { item: "kimchi", have: true },
        { item: "cheddar cheese", have: true },
        { item: "spring onion", have: true },
        { item: "black pepper", have: false },
        { item: "parmesan (optional, for the carbonara soul)", have: false }
      ],
      steps: [
        "Crisp chopped kimchi in a hot pan until the edges catch a little char.",
        "Push kimchi aside, add rice, and fry until each grain separates.",
        "Whisk eggs with a fistful of grated cheddar off-heat (this is your 'carbonara sauce').",
        "Kill the heat, fold the egg-cheese mix through the hot rice fast so it goes silky, not scrambled.",
        "Finish with cracked black pepper and sliced spring onion.",
        "Taste, add kimchi juice if it needs more punch."
      ],
      platingTip: "Pile high in a shallow bowl, extra cheddar snowed on top, one perfect curl of kimchi on the peak.",
      funFactOrTwist: "Carbonara's whole trick is egg-as-sauce — kimchi's fermented funk just steps in for guanciale's."
    }
  },
  {
    extraction: {
      fridgeIngredients: ["tortillas", "canned chickpeas", "feta", "cherry tomatoes", "yogurt"],
      cravingDish: "falafel wrap",
      cravingCuisine: "Middle Eastern",
      cravingFlavorNotes: ["zesty", "herby", "tangy", "fresh"]
    },
    recipe: {
      title: "Chickpea Smash Quesafel",
      tagline: "A falafel that gave up rolling itself into balls and became a quesadilla instead.",
      fusedCuisines: ["Middle Eastern", "Mexican"],
      fusionScore: { fridgePercent: 70, cravingPercent: 30 },
      ingredients: [
        { item: "canned chickpeas", have: true },
        { item: "tortillas", have: true },
        { item: "feta", have: true },
        { item: "cherry tomatoes", have: true },
        { item: "yogurt", have: true },
        { item: "cumin", have: false },
        { item: "garlic", have: false }
      ],
      steps: [
        "Roughly smash chickpeas with cumin and garlic — leave texture, don't puree.",
        "Spread the smash across half a tortilla, crumble feta over it, fold.",
        "Dry-toast in a pan until the tortilla blisters and the feta slumps.",
        "Mix yogurt with chopped cherry tomatoes for a quick tangy salsa-raita.",
        "Slice the quesafel into wedges, serve with the salsa-raita for dipping."
      ],
      platingTip: "Fan the wedges like a quesadilla platter, salsa-raita in a small bowl at the center.",
      funFactOrTwist: "Falafel and quesadillas are both 'crispy pocket of mashed legume/cheese' at heart — this just admits it."
    }
  },
  {
    extraction: {
      fridgeIngredients: ["ramen noodles", "pumpkin puree", "coconut milk", "chili flakes", "lime"],
      cravingDish: "pumpkin spice latte",
      cravingCuisine: "American cafe",
      cravingFlavorNotes: ["warm spice", "sweet", "creamy", "autumnal"]
    },
    recipe: {
      title: "Spooky Pumpkin Spice Ramen",
      tagline: "Everything the pumpkin spice latte wishes it had the courage to become.",
      fusedCuisines: ["Japanese", "American cafe"],
      fusionScore: { fridgePercent: 60, cravingPercent: 40 },
      ingredients: [
        { item: "ramen noodles", have: true },
        { item: "pumpkin puree", have: true },
        { item: "coconut milk", have: true },
        { item: "chili flakes", have: true },
        { item: "lime", have: true },
        { item: "cinnamon + nutmeg", have: false },
        { item: "soy sauce", have: false }
      ],
      steps: [
        "Simmer pumpkin puree with coconut milk until it loosens into a broth.",
        "Stir in a pinch of cinnamon and nutmeg — just enough to whisper 'latte', not 'dessert'.",
        "Season the broth with soy sauce and chili flakes until it's savory first, sweet second.",
        "Cook ramen noodles separately, drain, drop into the broth.",
        "Finish with a squeeze of lime to cut the richness.",
        "Serve in a mug for maximum pumpkin-spice-latte cosplay."
      ],
      platingTip: "Serve in a clear mug so the orange broth shows — garnish with a cinnamon-stick 'straw'.",
      funFactOrTwist: "Pumpkin, warm spice, and a creamy base are the actual flavor skeleton of a PSL — ramen just gives it a spine."
    }
  }
];

export function pickMockFusion() {
  const pick = MOCK_FUSIONS[Math.floor(Math.random() * MOCK_FUSIONS.length)];
  return structuredClone(pick);
}
